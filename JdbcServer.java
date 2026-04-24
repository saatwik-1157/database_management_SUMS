// File: JdbcServer.java
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.sql.*;
import java.util.*;

public class JdbcServer {
    private static final String DB_URL;
    private static final String DB_USER;
    private static final String DB_PASSWORD;

    static {
        Properties env = new Properties();
        try (InputStream input = new FileInputStream(".env")) {
            // Manual parsing since .env is KEY=VALUE not properties format
            BufferedReader reader = new BufferedReader(new InputStreamReader(input));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty() || line.startsWith("#")) continue;
                String[] parts = line.split("=", 2);
                if (parts.length == 2) env.setProperty(parts[0].trim(), parts[1].trim());
            }
        } catch (IOException e) { 
            System.err.println("Warning: .env file not found, using defaults");
        }
        DB_URL = "jdbc:mysql://" + env.getProperty("DB_HOST", "localhost") + "/" + env.getProperty("DB_NAME", "SmartUniversityDB");
        DB_USER = env.getProperty("DB_USER", "root");
        DB_PASSWORD = env.getProperty("DB_PASSWORD", "");
    }

    private static Connection getConn() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    private static String rsToJson(ResultSet rs) throws SQLException {
        StringBuilder sb = new StringBuilder("[");
        ResultSetMetaData md = rs.getMetaData();
        int cols = md.getColumnCount();
        boolean first = true;
        while (rs.next()) {
            if (!first) sb.append(",");
            sb.append("{");
            for (int i = 1; i <= cols; i++) {
                sb.append("\"").append(md.getColumnLabel(i)).append("\":");
                Object val = rs.getObject(i);
                if (val instanceof Number) sb.append(val);
                else if (val == null) sb.append("null");
                else sb.append("\"").append(val.toString().replace("\"", "\\\"")).append("\"");
                if (i < cols) sb.append(",");
            }
            sb.append("}");
            first = false;
        }
        sb.append("]");
        return sb.toString();
    }

    private static void handleQuery(HttpExchange ex, String sql) throws IOException {
        ex.getResponseHeaders().add("Content-Type", "application/json");
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        try (Connection conn = getConn();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            String json = rsToJson(rs);
            byte[] bytes = json.getBytes();
            ex.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
        } catch (SQLException e) {
            String err = "{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}";
            byte[] bytes = err.getBytes();
            ex.sendResponseHeaders(500, bytes.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
        }
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/campuses", ex -> handleQuery(ex, "SELECT * FROM Campuses"));
        server.createContext("/students", ex -> {
            String limit = "1000";
            String query = ex.getRequestURI().getQuery();
            if (query != null && query.contains("limit=")) {
                String[] parts = query.split("limit=");
                if (parts.length > 1) limit = parts[1].split("&")[0];
            }
            handleQuery(ex, "SELECT * FROM Students LIMIT " + limit);
        });
        server.createContext("/faculty", ex -> handleQuery(ex, "SELECT * FROM Faculty"));
        server.createContext("/assets", ex -> handleQuery(ex, "SELECT * FROM Assets"));
        server.createContext("/placements", ex -> handleQuery(ex, "SELECT * FROM PlacementResults"));
        server.createContext("/workflows", ex -> handleQuery(ex, "SELECT * FROM WorkflowHistory"));
        server.createContext("/transport", ex -> {
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            try (Connection conn = getConn();
                 Statement st = conn.createStatement()) {
                ResultSet rs1 = st.executeQuery("SELECT * FROM BusRoutes");
                String routesJson = rsToJson(rs1);
                ResultSet rs2 = st.executeQuery("SELECT * FROM Buses");
                String busesJson = rsToJson(rs2);
                String json = "{\"routes\":" + routesJson + ",\"buses\":" + busesJson + "}";
                byte[] bytes = json.getBytes();
                ex.sendResponseHeaders(200, bytes.length);
                try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
            } catch (SQLException e) {
                String err = "{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}";
                byte[] bytes = err.getBytes();
                ex.sendResponseHeaders(500, bytes.length);
                try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
            }
        });
        server.createContext("/alumni", ex -> handleQuery(ex, "SELECT * FROM Alumni"));
        server.createContext("/stats", ex -> {
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            try (Connection conn = getConn();
                 Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery("SELECT " +
                    "(SELECT COUNT(*) FROM Students) AS student_count, " +
                    "(SELECT COUNT(*) FROM Faculty) AS faculty_count, " +
                    "(SELECT COALESCE(SUM(Amount), 0) FROM Payments WHERE Status='Paid') AS total_revenue, " +
                    "(SELECT COUNT(*) FROM Assets) AS asset_count")) {
                if (rs.next()) {
                    String json = String.format("{\"student_count\":%d,\"faculty_count\":%d,\"total_revenue\":%.2f,\"asset_count\":%d}",
                        rs.getLong("student_count"), rs.getLong("faculty_count"), rs.getDouble("total_revenue"), rs.getLong("asset_count"));
                    byte[] bytes = json.getBytes();
                    ex.sendResponseHeaders(200, bytes.length);
                    try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
                }
            } catch (SQLException e) {
                String err = "{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}";
                byte[] bytes = err.getBytes();
                ex.sendResponseHeaders(500, bytes.length);
                try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
            }
        });
        server.setExecutor(null);
        System.out.println("Java JDBC API server listening on http://localhost:8000");
        server.start();
    }
}

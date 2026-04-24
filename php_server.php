<?php
// php_server.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require __DIR__.'/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

try {
    $pdo = new PDO(
        "mysql:host=" . ($_ENV['DB_HOST'] ?? 'localhost') . ";dbname=" . ($_ENV['DB_NAME'] ?? 'SmartUniversityDB'),
        $_ENV['DB_USER'] ?? 'root',
        $_ENV['DB_PASSWORD'] ?? '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
switch ($path) {
    case '/campuses':
        $stmt = $pdo->query('SELECT * FROM Campuses');
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '/students':
        $limit = $_GET['limit'] ?? 1000;
        $stmt = $pdo->prepare('SELECT * FROM Students LIMIT :l');
        $stmt->bindValue(':l', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '/faculty':
        $stmt = $pdo->query('SELECT * FROM Faculty');
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '/assets':
        $stmt = $pdo->query('SELECT * FROM Assets');
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '/placements':
        $stmt = $pdo->query('SELECT * FROM PlacementResults');
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '/workflows':
        $stmt = $pdo->query('SELECT * FROM WorkflowHistory');
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '/transport':
        $stmt = $pdo->query('SELECT * FROM BusRoutes');
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = $pdo->query('SELECT * FROM Buses');
        $buses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(['routes' => $routes, 'buses' => $buses]);
        break;
    case '/alumni':
        $stmt = $pdo->query('SELECT * FROM Alumni');
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '/stats':
        $sql = "SELECT 
                    (SELECT COUNT(*) FROM Students) AS student_count, 
                    (SELECT COUNT(*) FROM Faculty) AS faculty_count, 
                    (SELECT COALESCE(SUM(Amount), 0) FROM Payments WHERE Status='Paid') AS total_revenue,
                    (SELECT COUNT(*) FROM Assets) AS asset_count";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetch(PDO::FETCH_ASSOC));
        break;
    default:
        jsonResponse(['error' => 'Unknown endpoint: ' . $path], 404);
}
?>

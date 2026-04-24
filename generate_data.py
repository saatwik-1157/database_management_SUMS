import random
import datetime

# --- CONFIGURATION V6.1 ---
NUM_STUDENTS = 50000
NUM_FACULTY = 10500  # Added 500 more
CAMPUSES = [
    (1, 'Vellore Main Campus', 'Vellore'),
    (2, 'Chennai Tech Campus', 'Chennai'),
    (3, 'Bhopal Engineering Campus', 'Bhopal'),
    (4, 'Delhi Business Campus', 'Delhi')
]
BRANCHES = ['MIC', 'BCE', 'BBA', 'BCB', 'MIS', 'AI', 'DS', 'IOT']
YEARS = [21, 22, 23, 24, 25]

# Extended naming pool for variety
indian_first_names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Kavita", "Arjun", "Divya", "Siddharth", "Anjali", "Rohan", "Neha", "Varun", "Isha", "Karthik", "Riya", "Aavishkar", "Tanvi", "Pranav", "Ishani", "Manish", "Shreya", "Aditya", "Meera", "Sameer", "Pooja", "Abhishek", "Aarohi", "Sandeep", "Kyra", "Aarav", "Vihaan", "Advik", "Saanvi", "Ananya", "Ishaan", "Sai", "Aadhya", "Krishna", "Arnav", "Kabir", "Kiara", "Zoya", "Ishir", "Inaya", "Ayan", "Myra", "Reyansh", "Saira", "Vivaan"]
indian_last_names = ["Sharma", "Verma", "Patel", "Reddy", "Singh", "Iyer", "Rao", "Das", "Kapoor", "Malhotra", "Gupta", "Joshi", "Choudhury", "Nair", "Kulkarni", "Deshmukh", "Agarwal", "Bose", "Menon", "Saxena", "Mishra", "Pandey", "Trivedi", "Chauhan", "Bhardwaj", "Kumar", "Rani", "Devi", "Laxmi", "Prasad", "Naidu", "Shetty", "Pillai", "Gill", "Mehta", "Bahl", "Kaur", "Sethi", "Dubey", "Shukla", "Pandey"]

# Courses definitions
ELITE_COURSES = [
    ('AI301', 'Neural Networks', 4), ('CY402', 'Ethical Hacking', 3), ('DS201', 'Big Data Analytics', 4),
    ('IOT101', 'Sensor Networks', 3), ('MGT501', 'Strategic Leadership', 3), ('BIO302', 'Genomic Sequencing', 4),
    ('PHY101', 'Quantum Mechanics', 4), ('CHM202', 'Organic Synthesis', 3), ('MAT401', 'Advanced Calculus', 4),
    ('ENG101', 'Business Communication', 2), ('CSE505', 'Cloud Computing', 4), ('CSE601', 'Distributed Systems', 4),
    ('ECE301', 'VLSI Design', 3), ('ME202', 'Thermodynamics', 3), ('BBA105', 'Financial Accounting', 3),
    ('BCB404', 'Bio-Informatics', 3), ('AI202', 'Machine Learning', 4), ('CY303', 'Network Security', 3)
]

def get_random_date(start_year, end_year):
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return f"{year}-{month:02d}-{day:02d}"

def generate_full_data():
    sql = []
    sql.append("-- Smart University DBMS - Ultra-Enterprise V6.1 Multi-Campus Master Data")
    sql.append("USE SmartUniversityDB;\n")
    sql.append("SET FOREIGN_KEY_CHECKS = 0;")

    # 1. Departments per Campus
    sql.append("-- 1. Departments across 4 Strategic Campuses")
    sql.append("INSERT IGNORE INTO Departments (DeptID, DeptName, CampusID, Building, Budget) VALUES")
    dept_names = ['Computer Science', 'Electronic Engineering', 'Mechanical Engineering', 'Business School', 'Integrated Cybersecurity', 'Data Science', 'Artificial Intelligence', 'Biotechnology']
    
    dept_id = 1
    dept_inserts = []
    campus_depts = {} # campus_id -> [dept_ids]
    
    for campus_id, campus_name, city in CAMPUSES:
        campus_depts[campus_id] = []
        for name in dept_names:
            budget = random.randint(20000000, 80000000)
            building = f"Tower-{random.choice(['Alpha', 'Beta', 'Gamma', 'Sigma'])}-{random.randint(1, 10)}"
            dept_inserts.append(f"({dept_id}, '{name} ({city})', {campus_id}, '{building}', {budget})")
            campus_depts[campus_id].append(dept_id)
            dept_id += 1
            
    sql.append(",\n".join(dept_inserts) + ";\n")

    # 1.5 Elite Courses
    sql.append("-- 1.5 Global Course Catalog")
    sql.append("INSERT IGNORE INTO Courses (CourseID, CourseTitle, Credits, DeptID) VALUES")
    course_inserts = []
    for cid, title, cred in ELITE_COURSES:
        dept = random.randint(1, 32)
        course_inserts.append(f"('{cid}', '{title}', {cred}, {dept})")
    sql.append(",\n".join(course_inserts) + ";\n")

    # 2. Students (50,000)
    sql.append("-- 2. Massive Student Registry (50,000 Records)")
    student_inserts = []
    for i in range(1, NUM_STUDENTS + 1):
        fn = random.choice(indian_first_names)
        ln = random.choice(indian_last_names)
        year = random.choice(YEARS)
        branch = random.choice(BRANCHES)
        reg_no = f"{year}{branch}{i:05d}"
        email = f"{fn.lower()}.{ln.lower()}{reg_no}@sums.global.edu"
        dob = get_random_date(2000, 2007)
        
        campus_id = random.choice([c[0] for c in CAMPUSES])
        dept = random.choice(campus_depts[campus_id])
        
        student_inserts.append(f"('{fn}', '{ln}', '{email}', '{dob}', {dept})")
        
        if i % 5000 == 0 or i == NUM_STUDENTS:
            sql.append("INSERT IGNORE INTO Students (FirstName, LastName, Email, DOB, DeptID) VALUES")
            sql.append(",\n".join(student_inserts) + ";")
            student_inserts = []

    # 3. Faculty (10,500 - including 500 new ones)
    sql.append("\n-- 3. Faculty & Academic Staff (10,500 Records)")
    faculty_inserts = []
    for i in range(1, NUM_FACULTY + 1):
        fn = random.choice(indian_first_names)
        ln = random.choice(indian_last_names)
        email = f"{fn.lower()}.{ln.lower()}{i}@faculty.sums.global.edu"
        phone = f"+91-{random.randint(7000000000,9999999999)}"
        hire_date = get_random_date(2010, 2025)
        
        campus_id = random.choice([c[0] for c in CAMPUSES])
        dept = random.choice(campus_depts[campus_id])
        
        rank = random.choice(['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer'])
        faculty_inserts.append(f"('{fn}', '{ln}', '{email}', '{phone}', '{hire_date}', {dept}, '{rank}')")
        
        if i % 1000 == 0 or i == NUM_FACULTY:
            sql.append("INSERT IGNORE INTO Faculty (FirstName, LastName, Email, Phone, HireDate, DeptID, FacultyRank) VALUES")
            sql.append(",\n".join(faculty_inserts) + ";")
            faculty_inserts = []

    # 4. Assets (5,000)
    sql.append("\n-- 4. Global Asset Inventory")
    sql.append("INSERT IGNORE INTO Assets (CampusID, AssetName, SerialNo, AssetType, ConditionLevel, EstimatedValue) VALUES")
    asset_types = [('MacBook Pro M3 Max', 'IT Equipment'), ('NVIDIA H100 Node', 'IT Equipment'), ('Tesla Model 3 Campus Patrole', 'Vehicle'), ('Herman Miller Embody', 'Furniture'), ('Thermo Fisher PCR System', 'Lab Hardware')]
    asset_inserts = []
    for i in range(1, 5001):
        c_name, t = random.choice(asset_types)
        campus_id = random.choice([c[0] for c in CAMPUSES])
        sn = f"SN-{campus_id}-{i:05d}-{random.randint(1000,9999)}"
        cond = random.choice(['New', 'Excellent', 'Good'])
        val = random.randint(50000, 5000000)
        asset_inserts.append(f"({campus_id}, '{c_name}', '{sn}', '{t}', '{cond}', {val})")
        
        if i % 1000 == 0 or i == 5000:
            sql.append(",\n".join(asset_inserts) + (";" if i == 5000 else ""))
            if i < 5000:
                sql.append("INSERT IGNORE INTO Assets (CampusID, AssetName, SerialNo, AssetType, ConditionLevel, EstimatedValue) VALUES")
            asset_inserts = []

    sql.append("SET FOREIGN_KEY_CHECKS = 1;")
    return "\n".join(sql)

with open('data_massive_v6.sql', 'w', encoding='utf-8') as f:
    f.write(generate_full_data())

print("Ultra-Enterprise V6.1 Massive Data (50k Students / 10.5k Faculty / Elite Courses) generated successfully!")

with open('data_massive_v6.sql', 'w', encoding='utf-8') as f:
    f.write(generate_full_data())

print("Ultra-Enterprise V6.0 Massive Data (50k Students / 10k Faculty) generated successfully!")




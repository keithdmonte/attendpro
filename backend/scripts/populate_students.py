#!/usr/bin/env python3
"""
Script to delete all existing students and populate with random students per class
"""
import requests
import random
import string

API_URL = "http://127.0.0.1:8000"

# Class list
CLASSES = ["FYCO1", "FYCO2", "SYCO1", "SYCO2", "TYCO1", "TYCO2"]

# Sample first names and last names for random generation
FIRST_NAMES = [
    "Aarav", "Aditi", "Akshay", "Ananya", "Arjun", "Avani", "Dev", "Diya",
    "Ishaan", "Kavya", "Krishna", "Meera", "Neha", "Pranav", "Priya",
    "Rahul", "Riya", "Rohan", "Saanvi", "Samar", "Sanvi", "Shreya",
    "Siddharth", "Tanvi", "Vihaan", "Vivaan", "Yash", "Zara",
    "Alex", "Emma", "James", "Olivia", "Michael", "Sophia", "William", "Isabella"
]

LAST_NAMES = [
    "Patel", "Sharma", "Kumar", "Singh", "Gupta", "Verma", "Mehta", "Joshi",
    "Desai", "Shah", "Reddy", "Rao", "Iyer", "Nair", "Menon", "Pillai",
    "Khan", "Ali", "Ahmed", "Hussain", "Malik", "Sheikh", "Ansari",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"
]

def generate_random_email(name, roll_no):
    """Generate a random email"""
    return f"{name.lower().replace(' ', '')}{roll_no}@student.edu"

def generate_random_roll_no(class_name, index):
    """Generate roll number based on class"""
    year_map = {"FY": "2024", "SY": "2023", "TY": "2022"}
    year = year_map.get(class_name[:2], "2024")
    section = class_name[-1]
    return f"{year}{section}{index:03d}"

def delete_all_students():
    """Delete all existing students"""
    print("🗑️  Deleting all existing students...")
    
    # Get all students
    response = requests.get(f"{API_URL}/students/")
    if response.status_code == 200:
        students = response.json()
        deleted_count = 0
        for student in students:
            delete_response = requests.delete(f"{API_URL}/students/{student['id']}")
            if delete_response.status_code == 204:
                deleted_count += 1
        print(f"✅ Deleted {deleted_count} students")
    else:
        print(f"⚠️  Could not fetch students: {response.status_code}")

def create_random_student(class_name, index):
    """Create a random student"""
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    full_name = f"{first_name} {last_name}"
    roll_no = generate_random_roll_no(class_name, index)
    email = generate_random_email(full_name, index)
    
    student_data = {
        "roll_no": roll_no,
        "name": full_name,
        "email": email,
        "class_name": class_name
    }
    
    return student_data

def populate_students():
    """Populate students for each class"""
    print("\n📚 Creating students for each class...")
    
    total_created = 0
    
    for class_name in CLASSES:
        # Random number between 15-20 students per class
        num_students = random.randint(15, 20)
        print(f"\n📖 {class_name}: Creating {num_students} students...")
        
        created_count = 0
        for i in range(1, num_students + 1):
            student_data = create_random_student(class_name, i)
            
            try:
                response = requests.post(f"{API_URL}/students/", json=student_data)
                if response.status_code == 201:
                    created_count += 1
                    print(f"  ✅ {student_data['name']} ({student_data['roll_no']})")
                else:
                    print(f"  ❌ Failed to create {student_data['name']}: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"  ❌ Error creating {student_data['name']}: {e}")
        
        total_created += created_count
        print(f"  📊 Created {created_count}/{num_students} students for {class_name}")
    
    print(f"\n✅ Total students created: {total_created}")

def main():
    print("=" * 60)
    print("🎓 Student Population Script")
    print("=" * 60)
    
    # Delete all existing students
    delete_all_students()
    
    # Populate new students
    populate_students()
    
    print("\n" + "=" * 60)
    print("✨ Done!")
    print("=" * 60)

if __name__ == "__main__":
    main()


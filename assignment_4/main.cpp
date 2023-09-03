#include "student.h"
#include <iostream>
#include <vector>

#ifdef _WIN32
#define CLEAR "cls"
#else // In any other OS
#define CLEAR "clear"
#endif

Student createStudent();
std::string getName();
std::string getRollNumber();
int getAge();
double getGrade();
bool containsOnlyNumbers(std::string const &str);
bool containsOnlyLetters(std::string const &str);
std::vector<Student>::iterator
findStudentByRollNumber(std::vector<Student> &vec,
                        const std::string &rollNumber);
void updateStudent(std::vector<Student> &vec);
void deleteStudent(std::vector<Student> &vec);

int main() {

    std::vector<Student> student_v{Student("ion", "111", 12, .34),
                                   Student("ion", "222", 12, .34),
                                   Student("ion", "333", 12, .34)};
    char choice;
    while (true) {
        std::cout << "1. Add a new student"
                  << "\n2. Display all students"
                  << "\n3. Update student record"
                  << "\n4. Delete student record"
                  << "\n5. Exit program"
                  << "\n\nEnter the option number: ";
        std::cin >> choice;
        switch (choice) {
        case '1':
            // Add a new student
            system(CLEAR);

            student_v.push_back(createStudent());

            std::cout << "\nStudent successfully added" << std::endl;
            break;

        case '2':
            // Display all students
            for (auto it = student_v.begin(); it != student_v.end(); ++it) {
                std::cout << it->toString() << '\n';
            }
            break;

        case '3':
            // Update student info
            updateStudent(student_v);
            break;

        case '4':
            // Delete student
            deleteStudent(student_v);
            break;

        case '5':
            // Exist program
            exit(1);
            break;

        default:
            // Unknown option
            std::cout << "Unknown option!!!\n";
            break;
        }
        std::cout << "\nPress ENTER to continue...\n";
        std::cin.ignore();
        getchar();
        system(CLEAR);
    }
}

std::vector<Student>::iterator
findStudentByRollNumber(std::vector<Student> &vec,
                        const std::string &rollNumber) {

    auto it = vec.begin();
    for (; it != vec.end(); ++it) {
        if (it->getRollNumber() == rollNumber) {
            return it;
        }
    }

    return vec.end();
}

void deleteStudent(std::vector<Student> &vec) {
    std::string rollNmb = getRollNumber();

    auto iter = findStudentByRollNumber(vec, rollNmb);

    if (iter == vec.end()) {
        std::cout << "Student no found\n";
        return; // Nothing to delete
    }

    vec.erase(iter);
    std::cout << "Student deleted successfully\n";
}

void updateStudent(std::vector<Student> &vec) {
    std::string rollNmb = getRollNumber();

    auto iter = findStudentByRollNumber(vec, rollNmb);
    if (iter == vec.end()) {
        std::cout << "Student not found\n";
        return;
    }

    std::cout << "Enter new student info:\n";
    std::string newName = getName();
    int newAge = getAge();
    double newGrade = getGrade();

    iter->update(newName, newAge, newGrade);
}

Student createStudent() { // Maybe create on Heap and return a pointer?
    std::string name, rollNmb;
    int age;
    double grade;

    name = getName();

    rollNmb = getRollNumber();

    age = getAge();

    grade = getGrade();

    return Student(name, rollNmb, age, grade);
}

std::string getName() {
    std::string name = "";
    while (true) {
        std::cout << "\nEnter student's name: ";
        std::cin.ignore();
        getline(std::cin, name, '\n');

        if (!containsOnlyLetters(name)) {
            std::cout << "Name can contain only letters\n";
            continue;
        }
        return name;
    }
}

bool containsOnlyLetters(std::string const &str) {
    return str.find_first_not_of(
               "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ") ==
           std::string::npos;
}

std::string getRollNumber() {
    std::string rollNmb = "";
    while (true) {
        std::cout << "\nEnter student's roll number: ";
        std::cin >> rollNmb;
        if (containsOnlyNumbers(rollNmb)) {
            return rollNmb;
        }
        std::cout << "\nRoll number must contain only digits [0-9], other "
                     "characters are not allowed!!!\n";
    }
}

bool containsOnlyNumbers(std::string const &str) {
    return str.find_first_not_of("01234567890") == std::string::npos;
}

int getAge() {
    int age = 0;
    while (true) {
        std::cout << "\nEnter student's age: ";
        std::cin >> age;

        if (age <= 0) {
            std::cout << "\nNewborns and unborn are not allowed (age must be "
                         "greater tha 0)";
            continue;
        }
        if (age > 150) {
            std::cout << "\nAge can't be greater that 150";
            continue;
        }
        return age;
    }
}

double getGrade() {
    double grade = 0.0;
    while (true) {
        std::cout << "\nEnter student's grade: ";
        std::cin >> grade;
        if (grade <= 0.0 || grade > 10.0) {
            std::cout << "\nGrade must fit in the interval [1-10]";
            continue;
        }
        return grade;
    }
}
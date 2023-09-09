#include "catalog.h"
#include <chrono>
#include <functional>
#include <iostream>
#include <random>
#include <vector>

#ifdef _WIN32
#define CLEAR "cls"
#else // In any other OS
#define CLEAR "clear"
#endif

Student createStudent();
std::string getName();
std::string getRollNumber();
std::string generateRollNumber();
int getAge();
double getGrade();
bool containsOnlyLetters(std::string const &str);
void deleteStudent(Catalog &cat);
void updateStudent(Catalog &cat);

int main() {
    Catalog catalog = {Student("aaa", "111", 12, .34),
                       Student("bbb", "222", 12, .34),
                       Student("ccc", "333", 12, .34)};

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

            if (catalog.insertStudent(createStudent())) {
                std::cout << "\nStudent successfully added" << std::endl;
            } else {
                std::cout << "\nInsert failed, a student if this roll number "
                             "already exists"
                          << std::endl;
            }
            break;

        case '2':
            // Display all students
            catalog.display();
            break;

        case '3':
            // Update student info
            updateStudent(catalog);
            break;

        case '4':
            // Delete student
            deleteStudent(catalog);
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

void deleteStudent(Catalog &cat) {
    std::string r_nmb = getRollNumber();
    cat.removeStudent(r_nmb);
}

void updateStudent(Catalog &cat) {
    // TODO: check if roll number exists before asking for name, age and grade
    std::string r_nmb = getRollNumber();

    std::string name = getName();
    int age = getAge();
    double grade = getGrade();
    if (cat.updateStudent(r_nmb, name, age, grade)) {
        std::cout << "\nUpdated successfully\n";
    } else {
        std::cout << "\nStudent with specified roll number was not found\n";
    }
}

Student createStudent() { // Maybe create on Heap and return a pointer?
    std::string name, rollNmb;
    int age;
    double grade;

    name = getName();

    rollNmb = generateRollNumber();

    age = getAge();

    grade = getGrade();

    return Student(name, rollNmb, age, grade);
}

bool containsOnlyLetters(std::string const &str) {
    return str.find_first_not_of(
               "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ") ==
           std::string::npos;
}

std::string getRollNumber() {
    std::string rollNmb;
    std::cout << "\nEnter student's roll number: ";
    std::cin >> rollNmb;
    return rollNmb;
}

std::string generateRollNumber() {
    // Obtain the current time
    auto currentTime =
        std::chrono::system_clock::now().time_since_epoch().count();

    // Generate a random number
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(0, 9999);
    auto randomNumber = dist(gen);

    // Combine time with random number
    std::string combinedString =
        std::to_string(currentTime) + std::to_string(randomNumber);

    // Hash all of that
    std::hash<std::string> hasher;
    size_t hashedValue = hasher(combinedString);

    // Return the unique roll number
    return std::to_string(hashedValue);
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
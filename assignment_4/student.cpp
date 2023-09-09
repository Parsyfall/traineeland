#include "student.h"
#include <iostream>

Student::Student(std::string name, const std::string rollNum, int age,
                 double grade)
    : name(name), rollNumber(rollNum), age(age), grade(grade) {}

void Student::update(std::string newName, int newAge, double newGrade) {
    this->name = newName;
    this->age = newAge;
    this->grade = newGrade;
}

std::string Student::toString() const {
    return "\nName: " + name + "\nRoll number: " + rollNumber +
           "\nAge: " + std::to_string(age) +
           "\nGrade: " + std::to_string(grade);
}

std::string Student::getRollNumber() const { return rollNumber; }
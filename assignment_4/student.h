#ifndef STUDENT_H
#define STUDENT_H
#include <string>

class Student {
    std::string name;
    const std::string rollNumber;
    int age;
    double grade;

  public:
    Student(std::string name, const std::string rollNum, int age, double grade);

    void update(std::string newName, int newAge, double newGrade);
    std::string getRollNumber() const;
    std::string toString() const;
};

#endif
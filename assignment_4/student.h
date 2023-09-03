#ifndef STUDENT_H
#define STUDENT_H
#include <string>

class Student {
    std::string name;
    std::string rollNumber;
    int age;
    double grade;

  public:
    Student();
    Student(std::string name, std::string rollNum, int age, double grade);
    std::string getRollNumber() const;
    void update(std::string newName, int newAge, double newGrade);
    std::string toString() const;
};

#endif
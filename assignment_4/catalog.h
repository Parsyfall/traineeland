#ifndef CATALOG_H
#define CATALOG_H

#include "student.h"
#include <iostream>
#include <unordered_map>

class Catalog {
    std::unordered_map<std::string, Student> catalog;

  public:
    Catalog() = default;
    // Implemented for testing
    Catalog(std::initializer_list<Student> list);

    bool insertStudent(const Student &student);
    bool updateStudent(const std::string rollNumber, const std::string& newName,
                       int newAge, double newGrade);
    void removeStudent(const std::string rollNumber);
    void display() const;
};

#endif
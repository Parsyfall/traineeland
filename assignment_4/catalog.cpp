#include "catalog.h"

Catalog::Catalog(std::initializer_list<Student> list) {
    for (auto it = list.begin(); it != list.end(); ++it) {
        catalog.insert(std::make_pair(it->getRollNumber(), *it));
    }
}

bool Catalog::insertStudent(const Student &student) {
    auto result =
        catalog.insert(std::make_pair(student.getRollNumber(), student));
    // Return true if successfully inserted, false otherwise
    return result.second;
}

void Catalog::display() const {
    if (catalog.begin() == catalog.end()) {
        std::cout << "\nThere are no students\n";
    }
    for (auto it = catalog.begin(); it != catalog.end(); ++it) {
        std::cout << it->second.toString() << '\n';
    }
}

bool Catalog::updateStudent(const std::string rollNumber,
                            const std::string &newName, int newAge,
                            double newGrade) {

    try {
        catalog.at(rollNumber).update(newName, newAge, newGrade);
    } catch (const std::out_of_range &e) {
        // Failed to update, roll number not found
        return false;
    }
    // Updated successfully
    return true;
}

void Catalog::removeStudent(const std::string rollNumber) {
    catalog.erase(rollNumber);
}
const Sequelize = require("sequelize");

var sequelize = new Sequelize(
  "diaxvjzb",
  "diaxvjzb",
  "zgXLKHu7NWwyi3O2URTMDeidvyOQ1uD8",
  {
    host: "raja.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var Student = sequelize.define("Student", {
  studentID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  isInternationalStudent: Sequelize.BOOLEAN,
  expectedCredential: Sequelize.STRING,
  status: Sequelize.STRING,
  registrationDate: Sequelize.STRING,
});

var Image = sequelize.define("Image", {
  imageId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  imageUrl: Sequelize.STRING,
  version: Sequelize.INTEGER,
  width: Sequelize.INTEGER,
  height: Sequelize.INTEGER,
  format: Sequelize.STRING,
  resourceType: Sequelize.STRING,
  uploadedAt: Sequelize.DATE,
  originalFileName: Sequelize.STRING,
  mimeType: Sequelize.STRING,
});

var Program = sequelize.define("Program", {
  programCode: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  programName: Sequelize.STRING,
});

Program.hasMany(Student, { foreignKey: "program" });

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(function () {
        resolve();
      })
      .catch(function (err) {
        console.log(err);
        reject("unable to sync the database");
      });
  });
};

module.exports.getAllStudents = function () {
  return new Promise(function (resolve, reject) {
    Student.findAll({ order: ["studentID"] })
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getStudentsByStatus = function (status) {
  return new Promise(function (resolve, reject) {
    Student.findAll({ where: { status: status } })
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getStudentsByProgramCode = function (program) {
  return new Promise(function (resolve, reject) {
    Student.findAll({ where: { program: program } })
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getStudentsByExpectedCredential = function (credential) {
  return new Promise(function (resolve, reject) {
    Student.findAll({ where: { expectedCredential: credential } })
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getStudentById = function (sid) {
  return new Promise(function (resolve, reject) {
    Student.findAll({ where: { studentID: sid } })
      .then(function (data) {
        resolve(data[0]);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getPrograms = function () {
  return new Promise(function (resolve, reject) {
    Program.findAll({ order: ["programCode"] })
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.addStudent = function (studentData) {
  return new Promise(function (resolve, reject) {
    studentData.isInternationalStudent = studentData.isInternationalStudent
      ? true
      : false;

    Object.keys(studentData).map(function (key) {
      studentData[key] = studentData[key] == "" ? null : studentData[key];
    });

    Student.create(studentData)
      .then(function () {
        resolve("Student created successfully");
      })
      .catch(function () {
        reject("unable to create student");
      });
  });
};

module.exports.updateStudent = function (studentData) {
  return new Promise(function (resolve, reject) {
    studentData.isInternationalStudent = studentData.isInternationalStudent
      ? true
      : false;

    Object.keys(studentData).map(function (key) {
      studentData[key] = studentData[key] == "" ? null : studentData[key];
    });

    Student.update(studentData, { where: { studentID: studentData.studentID } })
      .then(function () {
        resolve("Student updated successfully");
      })
      .catch(function () {
        reject("Unable to update student");
      });
  });
};

module.exports.addImage = function (imageData) {
  return new Promise(function (resolve, reject) {
    Image.create(imageData)
      .then(function () {
        resolve("Image created successfully");
      })
      .catch(function (err) {
        reject("Unable to create image");
      });
  });
};

module.exports.getImages = function () {
  return new Promise(function (resolve, reject) {
    Image.findAll()
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.addProgram = function (programData) {
  return new Promise(function (resolve, reject) {
    Object.keys(programData).map(function (key) {
      programData[key] = programData[key] == "" ? null : programData[key];
    });

    Program.create(programData)
      .then(function () {
        resolve("Program created successfully");
      })
      .catch(function (err) {
        reject("unable to create program");
        console.log(err);
      });
  });
};

module.exports.updateProgram = function (programData) {
  return new Promise(function (resolve, reject) {
    Object.keys(programData).map(function (key) {
      programData[key] = programData[key] == "" ? null : programData[key];
    });

    Program.update(programData, {
      where: { programCode: programData.programCode },
    })
      .then(() => {
        resolve("Program updated successfully");
      })
      .catch(function (err) {
        reject("Unable to update student: " + err);
      });
  });
};

module.exports.getProgramByCode = function (pcode) {
  return new Promise(function (resolve, reject) {
    Program.findAll({ where: { programCode: pcode } })
      .then(function (data) {
        resolve(data[0]);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.deleteProgramByCode = function (pcode) {
  return new Promise(function (resolve, reject) {
    Program.destroy({ where: { programCode: pcode } })
      .then(function () {
        resolve("Program deleted successfully");
      })
      .catch(function () {
        reject("Unable to delete program");
      });
  });
};

module.exports.deleteStudentById = function (id) {
  return new Promise(function (resolve, reject) {
    Student.destroy({ where: { studentID: id } })
      .then(function () {
        resolve("Student deleted successfully");
      })
      .catch(function (err) {
        reject("Unable to delete student");
      });
  });
};

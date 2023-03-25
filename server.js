/*********************************************************************************
 *  WEB322 – Assignment 05
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
 *  assignment has been copied manually or electronically from any other source (including web sites) or
 *  distributed to other students.
 *
 *  Name: Vimal Sunkria  Student ID: 158576215 Date: 24 March, 2023
 *
 *  Online (Cyclic) Link: https://nice-ruby-crane-fez.cyclic.app/
 *
 ********************************************************************************/

var express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const cloudinary = require("cloudinary").v2;

var app = express();
var HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const dataService = require("./data-service");

cloudinary.config({
  cloud_name: "dlei8hlyj",
  api_key: "225788388644212",
  api_secret: "iiZ3toH-zUQmecUMbSKWqQMw4ZU",
});
const upload = multer();

app.engine(".hbs", exphbs.engine({ extname: "hbs" }));

app.set("view engine", ".hbs");

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",

    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/students/add", (req, res) => {
  dataService
    .getPrograms()
    .then((data) => res.render("addStudent", { programs: data }))
    .catch((err) => res.render("addStudent", { programs: [] }));
});

app.get("/students", (req, res) => {
  const status = req.query.status;
  const program = req.query.program;
  const credential = req.query.credential;

  if (status) {
    dataService
      .getStudentsByStatus(status)
      .then((students) => {
        if (students.length > 0) res.render("students", { students });
        else res.render("students", { message: "No results" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error retrieving students");
      });
  } else if (program) {
    dataService
      .getStudentsByProgramCode(program)
      .then((students) => {
        if (students.length > 0) res.render("students", { students });
        else res.render("students", { message: "No results" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error retrieving students");
      });
  } else if (credential) {
    dataService
      .getStudentsByExpectedCredential(credential)
      .then((students) => {
        if (students.length > 0) res.render("students", { students });
        else res.render("students", { message: "No results" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error retrieving students");
      });
  } else {
    dataService
      .getAllStudents()
      .then((students) => {
        if (students.length > 0) res.render("students", { students });
        else res.render("students", { message: "No results" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error retrieving students");
      });
  }
});

app.get("/students/delete/:studentID", (req, res) => {
  const studentID = req.params.studentID;
  dataService
    .deleteStudentById(studentID)
    .then(() => res.redirect("/students"))
    .catch(() =>
      res.status(500).send("Unable to Remove Student / Student not found")
    );
});

app.post("/student/update", (req, res) => {
  console.log(req.body.studentID);
  dataService
    .updateStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((error) => {
      console.error(error);
      res.send(error);
    });
});

app.post("/students/add", function (req, res) {
  dataService
    .addStudent(req.body)
    .then(() => {
      console.log("Student added");
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Unable to add student");
    });
});

app.get("/student/:studentId", (req, res) => {
  let viewData = {};

  dataService
    .getStudentById(req.params.studentId)
    .then((data) => {
      if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(dataService.getPrograms)
    .then((data) => {
      viewData.programs = data; // store program data in the "viewData" object as "programs"

      // loop through viewData.programs and once we have found the programCode that matches
      // the student's "program" value, add a "selected" property to the matching
      // viewData.programs object

      for (let i = 0; i < viewData.programs.length; i++) {
        if (viewData.programs[i].programCode == viewData.student.program) {
          viewData.programs[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.programs = []; // set programs to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData }); // render the "student" view
      }
    })
    .catch((err) => {
      res.status(500).send("Unable to Show Students");
    });
});

app.get("/programs/add", (req, res) => {
  res.render("addProgram");
});

app.get("/programs", (req, res) => {
  dataService
    .getPrograms()
    .then((programs) => {
      if (programs.length > 0) res.render("programs", { programs });
      else res.render("programs", { message: "No results found." });
    })
    .catch((err) => {
      console.error(err);
      res.render("programs", { message: "An error occurred." });
    });
});

app.get("/program/:programCode", (req, res) => {
  dataService
    .getProgramByCode(req.params.programCode)
    .then((data) => {
      if (data) res.render("program", { program: data });
      else res.status(404).send("Program Not Found");
    })
    .catch(() => res.status(404).send("Program Not Found"));
});

app.get("/programs/delete/:programCode", (req, res) => {
  dataService
    .deleteProgramByCode(req.params.programCode)
    .then(() => res.redirect("/programs"))
    .catch((err) =>
      res.status(500).send("Unable to Remove Program / Program not found")
    );
});

app.post("/program/update", (req, res) => {
  dataService
    .updateProgram(req.body)
    .then(() => res.redirect("/programs"))
    .catch((error) => res.json({ message: err }));
});

app.post("/programs/add", function (req, res) {
  dataService
    .addProgram(req.body)
    .then(() => res.redirect("/programs"))
    .catch((err) => res.json({ message: err }));
});

app.get("/images/add", (req, res) => {
  res.render("addImage");
});

app.get("/images", function (req, res) {
  dataService
    .getImages()
    .then(function (images) {
      if (images.length > 0) res.render("images", { images });
      else res.render("images", { message: "no results" });
    })
    .catch(function (err) {
      console.error(err);
      res.render("images", { message: "An error occurred." });
    });
});

app.post("/images/add", upload.single("imageFile"), function (req, res) {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processForm(uploaded);
    });
  } else {
    processForm("");
  }

  function processForm(uploaded) {
    let imgData = {};
    imgData.imageId = uploaded.public_id;
    imgData.imageUrl = uploaded.url;
    imgData.version = uploaded.version;
    imgData.width = uploaded.width;
    imgData.height = uploaded.height;
    imgData.format = uploaded.format;
    imgData.resourceType = uploaded.resource_type;
    imgData.uploadedAt = uploaded.created_at;
    imgData.originalFileName = req.file.originalname;
    imgData.mimeType = req.file.mimetype;

    dataService
      .addImage(imgData)
      .then(() => res.redirect("/images"))
      .catch(() => res.status(500).send("Error adding image"));
  }
});

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

app.use((req, res) => {
  res.status(404).send("<h1>Error: 404 Page Not Found</h1>");
});

dataService
  .initialize()
  .then(() =>
    app.listen(HTTP_PORT, () =>
      console.log("server listening on: http://localhost:" + HTTP_PORT + "/")
    )
  )
  .catch((err) => console.log(err));

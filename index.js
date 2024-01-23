import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

//DB connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "alishia5*now",
  port:5432
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Fetch all visited countries
let visited_countries = async ()  => {
  const result = await db.query("SELECT country_code FROM visited_countries");
  if(result.rows.length > 0 ){
    let countries = [];
    result.rows.forEach((country) => {
      countries.push(country.country_code);
    });
    //console.log(countries);
    return countries;
  }   
}

//Show countries visited
app.get("/", async (req, res) => {
  let countries_visited = await visited_countries();
  res.render("index.ejs", {
    "countries" : countries_visited,
    "total": countries_visited.length
  })
});

//Add new country visited
app.post("/add", async (req, res) => {
  const country_name = req.body.country.charAt(0).toUpperCase() + req.body.country.slice(1);
  try {
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",[country_name.toLowerCase()]);
    const country_code = result.rows[0].country_code;
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [country_code]);
      res.redirect("/");
    } 
    catch (error) {
        let countries = await visited_countries();
        res.render("index.ejs", {
          "countries" : countries,
          "total": countries.length,
          "error": "Country has already been added, try again.",
        });
    }

  }
  catch (error) {
    let countries = await visited_countries();
    res.render("index.ejs", {
      "countries" : countries,
      "total": countries.length,
      "error": "Country name does not exist, try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const BASE_URL = `https://pdp-movies-78.onrender.com/api`;

let pathName = window.location.pathname;

const sortList = {
  titleSorted: false,
  genreSorted: false,
  stockSorted: false,
  rateSorted: false,
};

let user = {
  name: "null",
};

let token = localStorage.getItem("token") ? localStorage.getItem("token") : null;

function decodeJWT(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

let currentMovieList = [];
let all_movies = [];
let all_genres = [];
let isAdmin = false;

const isAuth = () => {
  return Boolean(localStorage.getItem("token"));
};

if (isAuth()) {
  const userToken = localStorage.getItem("token");
  user = decodeJWT(userToken);
  isAdmin = user.isAdmin ? true : false;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log(pathName);

  switch (pathName) {
    case "/":
    case "/index.html":
      console.log("Im from index.html");
      mainPageLoader();
      break;
    case "/pages/login.html":
      console.log("Im from login.");
      loginPageLoader();
      break;
    case "/pages/register.html":
      console.log("Im from register");
      registerPageLoader();
      break;
    case "/pages/genres.html":
      genresPageLoader();
  }
});

function mainPageLoader() {
  const lengthMovies = document.getElementById("movieLength");
  let navLink = null;
  const movie_title = document.querySelector(".movie_title");
  const movie_genre = document.querySelector(".movie_genre");
  const movie_stock = document.querySelector(".movie_stock");
  const exampleModalLabel = document.querySelector("#exampleModalLabel");
  const exampleInputEmail1 = document.querySelector("#exampleInputEmail1");
  const movieStockNumber = document.getElementById("movieStockNumber");
  const movieRateNumber = document.getElementById("movieRateNumber");
  const exampleFormControlSelect1 = document.querySelector("#exampleFormControlSelect1");
  const navMenus = document.querySelector(".navMenus");
  const tBody = document.querySelector(".tBody");
  const editMovieBTN = document.getElementById("editMovieBTN");
  const searchInput = document.querySelector(".searchInput");
  const formModal = document.querySelector(".form-modal");
  const navLinkContainer = document.querySelector(".nav-pills");

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/genres`);
      const data = await res.json();

      all_genres = data;

      console.log(all_genres.length);

      let html = ``;

      all_genres.forEach((genre, idx) => {
        if (idx == 0) {
          html += '<a genre="all" class="nav-link active" id="v-pills-home-tab" data-toggle="pill" href="#v-pills-home" role="tab" aria-controls="v-pills-home" aria-selected="true">All Genres</a>';
          html += `<a genre="${genre.name.toLowerCase()}" class="nav-link " id="v-pills-home-tab" data-toggle="pill" href="#v-pills-home" role="tab" aria-controls="v-pills-home" aria-selected="true">${genre.name}</a>`;
        } else {
          html += `<a genre=${genre.name.toLowerCase()} class="nav-link" id="v-pills-home-tab" data-toggle="pill" href="#v-pills-home" role="tab" aria-controls="v-pills-home" aria-selected="true">${genre.name}</a>`;
        }
      });

      navLinkContainer.innerHTML = html;

      navLink = navLinkContainer.querySelectorAll("a");

      navLink.forEach((element) => {
        element.addEventListener("click", (e) => {
          const genre = element.getAttribute("genre");

          if (genre === "all") {
            drawMovies(all_movies);
            currentMovieList = all_movies;
          } else {
            const filtered_data = all_movies.filter((item) => item.genre.name.toLowerCase() === genre);
            drawMovies(filtered_data);
            currentMovieList = filtered_data;
          }
        });
      });
    } catch (error) {
      console.log("🚀 ~ file: main.js:7 ~ error:", error);
    }
  })();

  formModal.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  function sortFunction(sortListKeyCode, sortByKey) {
    if (sortList[sortListKeyCode] == false) {
      let sortedMovies = [...currentMovieList];
      sortMovie(sortedMovies, sortByKey); // end sort
      sortList[sortListKeyCode] = true;
    } else {
      sortList[sortListKeyCode] = false;
      drawMovies(currentMovieList);
    }
  }

  function searchResults(searchWords) {
    if (searchWords.length < 1) {
      drawMovies(currentMovieList);
      return 0;
    }
    const filterResults = [];

    for (let i = 0; i < currentMovieList.length; i++) {
      if (currentMovieList[i].title.toLowerCase().includes(searchWords.toLowerCase())) {
        filterResults.push(currentMovieList[i]);
      }
    }

    drawMovies(filterResults);
  }

  searchInput.addEventListener("submit", (e) => {
    e.preventDefault();
    let input = searchInput.querySelector("input");
    searchResults(input.value);
  });

  movie_title.addEventListener("click", () => sortFunction("titleSorted", "title"));

  movie_genre.addEventListener("click", () => sortFunction("genreSorted", "genre"));

  movie_stock.addEventListener("click", () => sortFunction("stockSorted", "numberInStock"));

  if (isAuth()) {
    const userToken = localStorage.getItem("token");
    // console.log(userToken);
    user = decodeJWT(userToken);
    console.log(user);
    navMenus.innerHTML = `
    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
    <li class="nav-item active">
      <a class="nav-link" href="index.html">${user.name}</a>
    </li>
    <li class="nav-item">
      <a class="nav-link logout" href="pages/login.html" >logout</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="pages/genres.html" >Genres</a>
    </li>
  </ul>
    `;

    const logout = document.querySelector(".logout");

    logout.addEventListener("click", () => {
      localStorage.removeItem("token");
    });
  } else {
    navMenus.innerHTML = `
    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
    <li class="nav-item active">
      <a class="nav-link" href="pages/login.html">Login</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="pages/register.html">Register</a>
    </li>
    
  </ul>`;
  }

  const fetchAndDrawGenres = () => {
    try {
      const data = all_genres;
      let html = ``;
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        html += `<option class='options' selected="">${element.name}</option>`;
      }
      exampleFormControlSelect1.innerHTML = html;
    } catch (error) {}
  };

  const changeMovieDB = async (name, stock, rate, genre, id, genreID) => {
    console.log(genreID, genre, id);

    const res = await fetch(`${BASE_URL}/genres`);
    const data = await res.json();
    let genreIDCurrent = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i].name === genre) {
        genreIDCurrent = data[i]._id;
        break;
      }
    }

    console.log(genreIDCurrent);
    try {
      const response = await fetch(`${BASE_URL}/movies/${id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "x-auth-token": `${token}`,
        },
        body: JSON.stringify({
          title: name,
          genreId: genreIDCurrent,
          numberInStock: stock,
          dailyRentalRate: rate,
        }),
      });

      console.log(response.status);

      if (response.status === 200) {
        window.location.pathname = "/index.html";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const editMovie = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/movies/${id}`);
      const data = await res.json();

      const { title, genre, numberInStock, dailyRentalRate, _id } = data;
      exampleModalLabel.textContent = title;
      exampleInputEmail1.value = title;
      movieStockNumber.value = numberInStock;
      movieRateNumber.value = dailyRentalRate;
      let genreID = genre._id;
      fetchAndDrawGenres(genre.name);

      editMovieBTN.addEventListener("click", () => {
        let movieName = exampleInputEmail1.value;
        let movieStock = movieStockNumber.value;
        let movieRate = movieRateNumber.value;
        let movieGenre = exampleFormControlSelect1.value;
        changeMovieDB(movieName, movieStock, movieRate, movieGenre, _id, genreID);
      });

      console.log("🚀 ~ file: main.js:38 ~ editMovie ~ data:", data);
    } catch (error) {
      console.log("🚀 ~ file: main.js:38 ~ editMovie ~ error:", error);
    }
  };

  const deleteMovie = async (id) => {
    const res = await fetch(`${BASE_URL}/movies/${id}`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        "x-auth-token": token,
      },
    });

    if (res.status === 200) {
      window.location.reload();
    }

    const msg = await res.text();
    console.log(msg);
  };

  // Draw movies
  function drawMovies(movies) {
    lengthMovies.textContent = movies.length;
    let html = ``;
    for (let i = 0; i < movies?.length; i++) {
      const element = movies[i];
      const { title, genre, numberInStock, dailyRentalRate, _id } = element;
      html += `
      <tr>
          <th scope="row">${title}</th>
          <td>${genre.name}</td>
          <td>${numberInStock}</td>
          <td>${dailyRentalRate}</td>
         ${
           isAdmin
             ? ` 
         <td class="editMovie" id="${_id}" data-toggle="modal" data-target="#exampleModal" style="cursor: pointer"><i class='bx bx-edit-alt'></i></td> 
         <td><button idx="${_id}" class="btn btn-danger movieDelete">Delete</button></td>`
             : isAuth()
             ? `<td class="editMovie" id="${_id}" data-toggle="modal" data-target="#exampleModal" style="cursor: pointer"><i class='bx bx-edit-alt'></i></td> `
             : `<td>Sign in for editing...</td>`
         }
        
      </tr>
      `;
    }

    tBody.innerHTML = `
    ${html}</br>
    ${isAuth() ? `<button class="btn btn-primary addMovieButton" data-toggle="modal" data-target="#exampleModal">Add Movie</button>` : ""}
    `;

    const addMovieBtn = document.querySelector(".addMovieButton");
    const editMovieBtn = document.querySelectorAll(".editMovie");
    const deleteMovieBtn = document.querySelectorAll(".movieDelete");

    deleteMovieBtn.forEach((btn) => {
      const id = btn.getAttribute("idx");
      btn.addEventListener("click", () => {
        deleteMovie(id);
      });
    });

    editMovieBtn.forEach((element) => {
      const id = element.getAttribute("id");
      element.addEventListener("click", () => {
        editMovie(id);
      });
    });

    addMovieBtn.addEventListener("click", () => {
      fetchAndDrawGenres();
      editMovieBTN.addEventListener("click", async () => {
        let movieName = exampleInputEmail1.value;
        let movieStock = movieStockNumber.value;
        let movieRate = movieRateNumber.value;
        let movieGenre = exampleFormControlSelect1.value;

        const resGenre = await fetch(`${BASE_URL}/genres`);
        const data = await resGenre.json();
        let genreIDCurrent = null;
        for (let i = 0; i < data.length; i++) {
          if (data[i].name === movieGenre) {
            genreIDCurrent = data[i]._id;
            break;
          }
        }

        try {
          console.log(token);

          const res = await fetch(`${BASE_URL}/movies`, {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              "x-auth-token": token,
            },
            body: JSON.stringify({
              title: movieName,
              genreId: genreIDCurrent,
              numberInStock: movieStock,
              dailyRentalRate: movieRate,
            }),
          });

          const msg = await res.text();
          console.log(msg);

          if (res.status === 200) {
            window.location.pathname = "/index.html";
          }
        } catch (e) {
          console.log(e);
        }
      });
    });
  }

  // Fetch
  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/movies`);
      const data = await res.json();

      all_movies = data;
      currentMovieList = all_movies;

      drawMovies(all_movies);
    } catch (error) {
      console.log("🚀 ~ file: main.js:7 ~ error:", error);
    }
  })();

  function sortMovie(data, type) {
    data.sort((movie1, movie2) => {
      if (type == "genre") {
        movie1 = movie1.genre.name.charCodeAt(0);
        movie2 = movie2.genre.name.charCodeAt(0);
      } else if (type == "title") {
        console.log("helloooo", type, movie1[type]);
        movie1 = movie1[type].charCodeAt(0);
        movie2 = movie2[type].charCodeAt(0);
      } else {
        movie1 = movie1[type];
        movie2 = movie2[type];
      }

      if (movie1 < movie2) return -1;
      if (movie1 > movie2) return 1;
      return 0;
    });

    drawMovies(data);
  }
}

function loginPageLoader() {
  const loginEmailInput = document.getElementById("loginEmailInput");
  const loginPasswordInput = document.getElementById("loginPasswordInput");

  const loginButton = document.getElementById("loginButton");

  loginButton.addEventListener("click", () => {
    async function fetUSER() {
      const response = await fetch(`${BASE_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          email: `${loginEmailInput.value}`,
          password: `${loginPasswordInput.value}`,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        localStorage.setItem("token", data.data);
        // // console.log(jwt_decode(data));
        // console.log(decodeJWT(data));
        // localStorage.setItem("token", data);
        window.location.pathname = "/index.html";
      }
    }

    fetUSER();
  });
}

function registerPageLoader() {
  const regEmailInput = document.getElementById("regEmailInput");
  const regNameInput = document.getElementById("regNameInput");
  const regPasswordInput = document.getElementById("regPasswordInput");
  const regConfPasswordInput = document.getElementById("regConfPasswordInput");
  const regButton = document.getElementById("regButton");

  regButton.addEventListener("click", () => {
    if (regConfPasswordInput.value == regPasswordInput.value) {
      async function fetUSER() {
        const response = await fetch(`${BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            email: `${regEmailInput.value}`,
            password: `${regPasswordInput.value}`,
            name: `${regNameInput.value}`,
          }),
        });
        if (response.status === 200) {
          window.location.pathname = "/pages/login.html";
        }
        const msg = await response.text();
        return msg;
      }

      fetUSER();
    } else {
      console.log("password is invalid");
    }
  });
}

function genresPageLoader() {
  const tbody = document.querySelector(".tBody");
  const addGenreInput = document.querySelector(".addMovieInput");
  const addGenreBtn = document.querySelector(".addMovieBtn");
  const navBar = document.querySelector(".navbar-collapse");
  // const deleteGenres = document.querySelector(".deleteGenre");
  // console.log(deleteGenre);

  navBar.innerHTML = `
  <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
  <li class="nav-item active">
    <a class="nav-link" href="index.html">${user.name}</a>
  </li>
  <li class="nav-item">
    <a class="nav-link logout" href="/pages/login.html" >logout</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#" >Genres</a>
  </li>
</ul>
  `;

  const deleteGenre = async (id) => {
    const res = await fetch(`${BASE_URL}/genres/${id}`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        "x-auth-token": token,
      },
    });

    if (res.status === 200) {
      window.location.reload();
    }

    const msg = await res.text();
    console.log(msg);
  };

  const fetchAndDrawGenres = async () => {
    try {
      const res = await fetch(`${BASE_URL}/genres`);
      const data = await res.json();
      let html = ``;
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        html += `
        <tr>
        <th scope="row">${element.name}</th>
        <td><button idx=${element._id} class="btn btn-danger deleteGenre">Delete</button></td>
        </tr>
        `;
      }
      tbody.innerHTML = html;

      const deleteBTNs = document.querySelectorAll(".deleteGenre");
      deleteBTNs.forEach((btn) => {
        const id = btn.getAttribute("idx");
        btn.addEventListener("click", () => {
          deleteGenre(id);
        });
      });
    } catch (error) {}
  };

  fetchAndDrawGenres();

  const logout = document.querySelector(".logout");

  logout.addEventListener("click", () => {
    localStorage.removeItem("token");
  });

  addGenreBtn.addEventListener("click", async () => {
    console.log(addGenreInput.value);
    console.log(token);
    const res = await fetch(`${BASE_URL}/genres`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "x-auth-token": token,
      },

      body: JSON.stringify({
        name: addGenreInput.value,
      }),
    });

    const msg = await res.text();
    console.log(msg);

    console.log(res.status);
    if (res.status === 200) {
      window.location.pathname = "/pages/genres.html";
    }
  });
}

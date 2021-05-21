const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
  // 把let filteredMovies = []移出searchForm監聽事件變成全域變數，就可以完整顯示80部電影
let selectPage = 1
let selectMode = "card"
// let mode = "card"

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const changeMode = document.querySelector('#change-mode')


function renderMovieCardMode(data) {
  let rawHTML = ""
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}
function renderMovieListMode(data) {
  let rawHTML = ""
  rawHTML += `
    <table class="table">
      <tbody>`
  data.forEach((item) => {
    rawHTML += `
      <tr>
        <td class="d-flex justify-content-between align-items-center">
          <img src="${POSTER_URL + item.image}" id="list-avatar">
          <h5>${item.title}</h5>
       
        <div class="button">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </td>
      </tr>`
  })
  rawHTML += `
      </tbody>
    </table>`

  dataPanel.innerHTML = rawHTML
}
// mode, selectPage
function displayMode(mode, page) {
  if (page !== null) {
    selectPage = page
  }
  if (mode !== null) {
    selectMode = mode
  }
  const data = getMoviesByPage(selectPage)
  selectMode === "card" ? renderMovieCardMode(data) : renderMovieListMode(data)
}

// amount
function renderPaginator() {
  const amount = filteredMovies.length ? filteredMovies.length : movies.length
  //Math.ceil()無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item" data-page="${page}"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  const currentPage = document.querySelector(`.page-item[data-page="${selectPage}"]`)
  currentPage.classList.add("active")
}

function getMoviesByPage(page) {
  // 這邊設data變數判斷，如果filteredMovies長度不為零，代表使用者在搜尋的動作
  // 所以問號後面是指"搜尋有東西回傳filteredMovies"，冒號後面是"否則回傳movies"
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "release date: " + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener("click", function onPaginatorClicked(event) {
  const target = event.target
  if (target.tagName !== 'A') return
  if (target.matches(".page-link")) {
    let pageItem = document.querySelectorAll('.page-item')
    pageItem.forEach(item => item.classList.remove('active'))
    target.parentElement.classList.add('active')
    const page = Number(target.dataset.page)
    // selectPage = page
    displayMode(null, page)
  }
})

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert("Cannot find movies with keyword: " + keyword)
  }

  // 搜尋movie除了for迴圈，還有filter()陣列函式。
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  //重製分頁器
  // renderPaginator(filteredMovies.length)
  renderPaginator()
  //預設顯示第 1 頁的搜尋結果
  // renderMovieList(getMoviesByPage(1))
  displayMode(null, 1)
})

changeMode.addEventListener('click', function onChangeModeClicked(event) {
  event.preventDefault()
  if (event.target.dataset.id === "list-mode") {
    // renderPaginator(filteredMovies.length)
    renderPaginator()
    // renderPaginator(movies.length)
    // renderMovieListMode(getMoviesByPage(selectPage))
    // mode = "list"
    displayMode("list", null)
  } else if (event.target.dataset.id === "card-mode") {
    // renderPaginator(filteredMovies.length)
    renderPaginator()
    // renderPaginator(movies.length)
    // renderMovieCardMode(getMoviesByPage(selectPage))
    // mode = "card"
    displayMode("card", null)
  }
})

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieCardMode(getMoviesByPage(1))
})

const STORAGE_KEY = 'BOOK_APPS';
const SAVED_EVENT = "saved-books";
const RENDER_EVENT = "render-books";
const SEARCH_EVENT = "search-books";

const bookList = [];

document.addEventListener('DOMContentLoaded', function (){

  const inputForm = document.getElementById('inputBook');

  inputForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function isStorageExist(){
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookList.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookList);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function generateId(){
  return +new Date();
}

function generateObject(id, title, author, year, isComplete){
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

document.addEventListener(SAVED_EVENT, () => {
  console.log('Data berhasil di simpan.');
});

document.addEventListener(RENDER_EVENT, () => {
  const completeBookshelfList   = document.getElementById('completeBookshelfList');
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  completeBookshelfList.innerHTML = '';
  incompleteBookshelfList.innerHTML = '';
  for(const book of bookList){
    const elem = makeBook(book);
    console.log(book.id + ' ' + book.isComplete);
    if(book.isComplete)
      completeBookshelfList.append(elem);
    else
      incompleteBookshelfList.append(elem);
  }
});

document.addEventListener(SEARCH_EVENT, function(event){
  const completeBookshelfList   = document.getElementById('completeBookshelfList');
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  completeBookshelfList.innerHTML = '';
  incompleteBookshelfList.innerHTML = '';

  const searchText = event.detail;
  const regex = new RegExp(`.*${searchText}.*`, "i");
  const filteredBooks = bookList.filter(book => regex.test(book.title));
  if(filteredBooks.length === 0){
    alert('Tidak berhasil menemukan buku dengan keyword tersebut');
    return;
  }

  for(const book of filteredBooks){
    const elem = makeBook(book);
    console.log(book.id + ' ' + book.isComplete);
    if(book.isComplete)
      completeBookshelfList.append(elem);
    else
      incompleteBookshelfList.append(elem);
  }
});

function findBook(id) {
  return bookList.find(book => book.id === id);
}

function findBookIndex(id){
  return bookList.findIndex(item => item.id === id);
}

function markBook(id){
  const target = findBook(id);
  if(target === undefined) return;
  target.isComplete = !target.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function showDeleteDialog() {
  return confirm("Apakah anda yakin untuk menghapus buku ini?");
}

function deleteBook(id){
  const confirmDelete = showDeleteDialog();
  if (!confirmDelete)
    return;
  const target = findBookIndex(id);
  const book = findBook(id);
  if (target === -1) return;
  bookList.splice(target, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert(`Buku ${book.title} telah dihapus dari daftar.`);
}

function makeBook(obj){
  const {id, title, author, year, isComplete} = obj;

  const container = document.createElement('article');
  const titleText = document.createElement('h3');
  const writerText = document.createElement('p');
  const yearText = document.createElement('p');

  container.setAttribute('id', `books#${id}`);
  container.classList.add('book_item');

  titleText.innerText = title;
  writerText.innerText = 'Penulis: ' + author;
  yearText.innerText = 'Tahun: ' + year;

  const actionContainer = document.createElement('div');
  const markButton = document.createElement('button');
  const deleteButton = document.createElement('button');

  actionContainer.classList.add('action');
  markButton.classList.add('green');
  deleteButton.classList.add('red');
  
  markButton.innerText = isComplete ? 'Belum selesai di Baca' : 'Selesai dibaca';
  deleteButton.innerText = 'Hapus buku';
  markButton.addEventListener('click', () => markBook(id));
  deleteButton.addEventListener('click', () => deleteBook(id));
  
  container.append(titleText);
  container.append(writerText);
  container.append(yearText);
  actionContainer.append(markButton);
  actionContainer.append(deleteButton);
  container.append(actionContainer);

  return container;
}

function addBook(){
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isComplete = document.getElementById('inputBookIsComplete').checked;
  const id = generateId();

  const obj = generateObject(id, title, author, year, isComplete);

  bookList.push(obj);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  console.log(bookList.length);
}

function searchBook(){
  const searchText = document.getElementById('searchBookTitle').value;
  const searchEvent = new CustomEvent(SEARCH_EVENT, { detail: searchText });
  document.dispatchEvent(searchEvent);
}
import * as model from './model.js';
import RecipeView from './views/recipeView.js';
import SearchView from './views/searchView.js';
import ResultsView from './views/resultsView.js';
import BookmarksView from './views/bookmarksView.js';
import PaginationView from './views/paginationView.js';
import AddRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import paginationView from './views/paginationView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);
    if (!id) return;
    //  console.log(RecipeView);
    RecipeView.renderSpinner();

    //  0)  Update results view to mark selected search result
    ResultsView.update(model.getSearchResultsPage());

    //  1) Updating bookmarks view
    BookmarksView.update(model.state.bookmarks);

    //  2) Loading recipe
    await model.loadRecipe(id);
    //  console.log(RecipeView);

    //  3) Rendering recipe
    RecipeView.render(model.state.recipe);
  } catch (err) {
    //  Temp error handling
    console.error(err);
    RecipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    ResultsView.renderSpinner();

    //  1) Get search query
    const query = SearchView.getQuery();
    if (!query) return;

    //  2) Load search results
    await model.loadSearchResults(query);

    //  3) Render results
    ResultsView.render(model.getSearchResultsPage());

    //  4) Render the initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
    RecipeView.renderError(err);
  }
};

const controlPagination = function (goToPage) {
  console.log(goToPage);
  //  1) Render new results
  ResultsView.render(model.getSearchResultsPage(goToPage));

  //  2) Render the NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // RecipeView.render(model.state.recipe);
  RecipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //  1) Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //  2) Update recipe view
  RecipeView.update(model.state.recipe);

  //  3) Render bookmarks
  BookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //  Show loading spinner
    AddRecipeView.renderSpinner();

    //  Upload the new recipe data
    console.log(newRecipe);
    await model.uploadRecipe(newRecipe);

    //  Render recipe
    RecipeView.render(model.state.recipe);

    //  Succes message
    AddRecipeView.renderMessage();

    //  Render bookmark view
    BookmarksView.render(model.state.bookmarks);

    //  Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //  Close Form
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    AddRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the application');
};

const init = function () {
  BookmarksView.addHandlerRender(controlBookmarks);
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerUpdateServings(controlServings);
  RecipeView.addHandlerBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();

"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const noImageURL = "https://tinyurl.com/missing-tv";
const tvMazeURL = "http://api.tvmaze.com/";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  //sends get request to tvmaze api with the search term included
  const response = await axios({
    baseURL: tvMazeURL,
    url: "search/shows",
    method: "GET",
    params: {
      q: term
    }
  });
  console.log(response);

  //creates and returns array of obj for search results
  return response.data.map(result => {
    const show = result.show;
    return{
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : noImageURL
    };
    
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

//when search term is submitted will call searchForShowAndDisplay which gets all shows matching that term and
//populates them on the dom
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

 async function getEpisodesOfShow(id) { 
  const response = await axios({
    baseURL: tvMazeURL,
    url: `shows/${id}/episodes`,
    method: "GET"
  });

  return response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
 }

/** Write a clear docstring for this function... */
/*Given a list of episode, create and li for each episode with name, season and episode number
then add them to the episodes area */

 function populateEpisodes(episodes) { 
  $episodesList.empty();

  for(let episode of episodes){
    const $episodeLi = $(
      `<li> ${episode.name} (season ${episode.season}, episode ${episode.number}) </li>`
    );
    $episodesList.append($episodeLi);
  }
  $episodesArea.show();
 }

 //created a function to get the episodes list from the api and display them when the episodes button is clicked
 //uses the closest ancestor with class of show for show-id for event delegation
 async function getEpisodesAndDisplay(evt){
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);

  populateEpisodes(episodes);
 }

 $showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
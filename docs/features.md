# Features

## Movie List

- Fetch movies from Supabase
- Display in grid view by default
- Toggle to list view
- Show:
  - poster
  - title
  - year
  - rating (if available)

## Search Bar

### Mode 1: Search
- Filters existing movies in real-time

### Mode 2: Find
- Calls TMDB API
- Shows results dropdown
- Clicking result:
  - saves movie to Supabase
  - redirects to /movie/[id]

## Movie Detail Page

- Loads movie by ID
- Displays:
  - poster, title, year, overview
- Editable:
  - rating
  - notes
  - watched
  - mood
  - rewatchable
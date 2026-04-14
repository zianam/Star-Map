# Star Map

An interactive data visualization of the 20 nearest stars to Earth, 
built with React and D3.js.

## Live Demo
https://zianam.github.io/Star-Map/

## About
Each star is plotted by its real distance from Earth, color-coded 
by spectral type (red dwarfs, yellow stars like our Sun, white and 
blue giants). Hover over any star to see its name, distance, and 
classification. Stars can be filtered by type using the checkboxes.

The data was scraped from stellarcatalog.com using Python and 
BeautifulSoup, then processed to add spectral colors and sizes.

## Tech Stack
- React + Vite
- D3.js (visualization)
- Python + BeautifulSoup (data scraping)

## Run Locally
npm install
npm run dev

## What I Learned
This was my first time using D3.js. I learned how to bind data to 
SVG elements, use scales to map real astronomical distances to 
pixel positions, and build interactive hover effects. I also 
learned how to deploy a React app with GitHub Actions.

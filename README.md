# Data Visualization Project

## Data

The data I propose to visualize for my project is a collection of board games from the BoardGameGeek (BGG) website as of February 2021. BGG is the largest online collection of board game data which consists of data on more than 100,000 total games (ranked and unranked). The voluntary online community contributes to the site with reviews, ratings, images, videos, session reports and live discussion forums on the expanding database of board games. This data set contains all ranked games (~20,000) as of the date of collection from the BGG database. Unranked games are ignored as they have not been rated by enough BGG users (a game should receive at least 30 votes to be eligible for ranking).

Dataset: https://www.kaggle.com/datasets/andrewmvd/board-games

## Questions & Tasks

The following tasks and questions will drive the visualization and interaction decisions for this project:

Questions for game gategories per decade route: 

 * How popular have different kinds of board games become over the years?
 * Do certain kinds of board games keep gettign more popular or have fallen out of style? 
 * Any outliers in a certain decade where a category was really popular?
 * How might the trend continue into the 2020s?

Questions for board game average rating vs average complexity route: 

* Is there a correlation between rating and complexity of board games?
* Are there other attributes of the dataset that have correlation with average rating (other than rank)?
* How can I include more information in a scatterplot about complexity vs rating to make things more interesting?

## Sketches

![iterated_sketch](https://github.com/user-attachments/assets/2371d0e4-63a7-473f-a044-734b51fe4751)

The sketch on the left is a bar chart that flexibly compares a number of features against average board game rating. The idea behind this visualization is that the msot relevant information is a board game's ranking, so users will likely want to know how each attribute compares to the ranking. The checkboxes to the right of the bar chart will allow the user to select what attribute they want to visualize in relation to average rating. The sketch on the right is a clustered bar chart depicting the quantity of games with certain mechanics over the years. In practice I will likely split the years into decades to reduce clutter. The most popular board game mechanics will be color coded and displayed next to eachother to show quantity in each decade. My first iteration of the idea was a stacked bar chart, but I think this is more clear to viewers. This second sketch relates to the question about how popular categories of board games have been over the years. The viewer can compare the bars for each category in each decade and come to their own conclusions. 


## Prototypes

Prototype for scatter plot of rank vs complexity: 

<img width="959" height="535" alt="Scatter Plot Board Games" src="https://github.com/user-attachments/assets/ff1d86a4-c73a-4805-8f6e-01530559acfe" />

Prototype for category quantity over the decades: 

<img width="953" height="535" alt="bar chart board games" src="https://github.com/user-attachments/assets/86edc9d6-582f-48da-82a8-9e86da9b624f" />


## Open Questions

I feel like analyzing the relationship between average rating and other attributes such as complexity is a more interesting question to persue since it's a real life question that would be interesting to research. However, I don't think a simple scatterplot of that nature is an interesting visualization. I'd like to figure out how to make it more interesting. The bar chart comparing category popularity over the decades is a better visualization, but I don't think the data really tells us that much. I'm unsure of which to procede with or if I just want to ask a different question. 

## Milestones

Week 5: Prototype designs

Week 6: Finalize idea and improve prototype. 

Week 7: Add interactive element to visualization. 

...

Week ?: Finish Project. 

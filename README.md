# Data Visualization Project

Vizhub: https://vizhub.com/jackschnair/ca2e047e27344b70b3f3c3329c9733ac

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

## Week 6 

I decided to go back to my scatterplot and add some more features to make it interesting. 
I forked my scatterplot with axes viz and added checkboxes to filter based on board game domains and mechanics.
Domains are essentially the type of game like strategy or family and mechanics are thigns like dice rolling or worker placement. 
The user can check each doman or mechanic to toggle the display. Most games have multiple of each, so as one of their domians or mechanics are checked the point will stay. 
The other feature I added was a color change for when you mouse over a domain or mechanic to make them more distinct for the viewer. 

<img width="1292" height="635" alt="week 6 chart" src="https://github.com/user-attachments/assets/aef4e350-4d24-45ad-b716-38aa934a01fd" />

## Week 7 

I've made a couple improvements from week 6. 
First I decided that the green highlighted points were a little jarring and it would be cleaner to just grey out the non-selected points. 
Now whatever you select stays black and everything else turns grey. The black points are rendered last so they appear in front. 
The other change I've made is adding tooltips to each point. 
Now when you hover over a point it displays the name of the game. 
Note: This feature only works in an expanded window. 
<img width="1297" height="627" alt="Screenshot 2025-10-09 202412" src="https://github.com/user-attachments/assets/67c6eaa9-8e11-4cfc-aa5b-d882bb2819bd" />

<img width="1296" height="618" alt="Screenshot 2025-10-09 201357" src="https://github.com/user-attachments/assets/5a4d3819-04b3-471b-bf07-1546bd9c4fd2" />

## Week 9

During week 9 I have made an effort to implement color into my visual.
To do this I have added a section to my visual labeled "Color Mapping" that allows the user to pick an aspect of the data to visualize and the color scheme.
The tricky part of my dataset for color mapping is that I am mostly concerned with discerning game domains and mechanics by color and many games have multiple of each.
I had to work around this limitation and came up with two solutions. The first is to just have the most popular domain (strategy) as one color and the rest as another.
The second is to just take the first listed domain, which makes for a more interesting visual but is less accurate. The most interesting in my opinion is the mechanics count.
This uses a gradient to visualize which games have greater or fewer mechanics.
Logically you can see that the games with more mechanics tend to be higher on the complexity scale.

<img width="1295" height="845" alt="Screenshot 2025-10-22 220435" src="https://github.com/user-attachments/assets/461191b4-ca49-4029-9946-da07ec584797" />

For the color scheme I made sure to include a color blind friendly option that uses a blue and orange color scheme as was suggested by this week's material. 

<img width="1295" height="839" alt="Screenshot 2025-10-22 220539" src="https://github.com/user-attachments/assets/1d6e2810-c307-4e4c-86de-d18cb7f0fd22" />


# Week 10

I had already implemented some of the interactivity ideas talked about in this week's videos.
In week 6 I added capability for the user to hover over a domain or mechanic and for the corresponding points to be highlighted. For this week I decided to implement something that was suggested in the discord a while ago. I added dropdown menus for fields in the x and y axes. The user will be able to choose from most numeric fields in the dataset: BGG Rating, BGG Rank, Complexity Average, Year Published, and Users Rated. Initially I restricted the x-axis to just BGG rating and rank since they went together and I could compare other fields against them. However, I realized that there is no reason to limit what the visualization can do so I just added all 5 fields to both axes. I also moved the legend to below the x-axis since some of these scatterplots cover the legend when generated. 


I think the following BGG Rank vs BGG Rating plot is pretty interesting as it shows that there is a hidden element that factors into the rank. 
If it were based purely on rating, then the scatterplot woudl just trend downwards with no outliers. 
I think that it must have something to do with the number of ratings that factors into the overall rank so if a few people give a game a 5 it doesn't instantly jump to the top of the ranks. 

<img width="1301" height="773" alt="Screenshot 2025-10-29 211505" src="https://github.com/user-attachments/assets/bee53d30-e639-4b61-b0a0-9c410134fcb9" />

# Week 11

This week I cleaned up the project a little bit and started by changing something that had been bothering me. I kept instinctually assuming the y-axis was the first label and x-axis was the second so I swapped them to be that way since others might feel the same way. Additionally I moved the fields section of the sidemenu so that domain and mechanics filters were together and the dropdowns were together. Another minor change was greying out fields in the X or Y axis that have already been chosen in the other. This prevents the user from making weird looking visuals where it's just a line since the x and y data are the same.
I have felt limited by my visual before with it just being a scatterplot, so I decided it was finally time to add an option to change the chart type. The sparkline plot works exceptionally well for if you're doing a time based plot like "year published" with y-axis always being counted. I also added tooltips to each point in the plot for convenience. I intend to keep adding chart types so the user can visualize the data in different ways. I think I will also bring in the idea of greying out options for certain plot types if they're not applicable.


<img width="1300" height="599" alt="Screenshot 2025-11-05 233719" src="https://github.com/user-attachments/assets/d2751196-1f70-4cda-a71d-3de05947b34e" />

# Week 12

In week 12 I wanted to expand on what I started in week 11 with the alternative kind of plots. 
On top of sparkline, I added barcharts. 
Pretty quickly I noticed that not all of my data works well with different kinds of plots so I greyed out certain features when using different kinds of plots.

<img width="1311" height="561" alt="Greyed_out" src="https://github.com/user-attachments/assets/7e0e6dc6-0cbf-491a-b481-814efffb7a7d" />

I also noticed that there are some clear outliers in some of the data that make the plots look a lot worse. 
I decided the best way to deal with this is to just filter out the outliers so we can have a better visual of the majority of the data. 
I know that this is not good practice, but I stand by it. 
For maximum players it is ridiculous to have 100 as an option. 

<img width="1311" height="598" alt="bad_max_players" src="https://github.com/user-attachments/assets/6c41c6a4-7ffb-4e89-9b4f-acef3ec467a6" />

<img width="1307" height="588" alt="good_max_players" src="https://github.com/user-attachments/assets/5be42831-a673-46e7-a9d2-60bd6fcb119e" />

These changes make my visual a lot cleaner with this added functionality of multiple plot types.

## Existing Questions

I feel like analyzing the relationship between average rating and other attributes such as complexity is a more interesting question to persue since it's a real life question that would be interesting to research. However, I don't think a simple scatterplot of that nature is an interesting visualization. I'd like to figure out how to make it more interesting. The bar chart comparing category popularity over the decades is a better visualization, but I don't think the data really tells us that much. I'm unsure of which to procede with or if I just want to ask a different question. 

I feel like I've kind of hit the extend of what I want to do with this visualization. 
For this project, can I explore multiple visualizations instead of expanding on just this one? 
I think there's a lot of neat stuff to explore with this data but none of it is that in depth enough to justify complex visualizations. 
Maybe a can be proved wrong here, but I think I would rather do more varied visualizations instead of keep going down this one path.

## Current thoughts

I ended up trying to do multiple kinds of visuals in one to make my dataset more interesting. 
I think this is a good compromise for doing more visualization with a straight forward dataset.

## Milestones

Week 5: Prototype designs

Week 6: Finalize idea and improve prototype. 

Week 7: Add interactive element to visualization. 

Week 8: Break

Week 8: Color

Week 9: More Color

Week 10: Interactivity

Week 11: Additional views

Week 12: General improvements

...

Week ?: Finish Project. 

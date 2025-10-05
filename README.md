# CRIME LOOKUP REPO

<img width="806" height="481" alt="image" src="https://github.com/user-attachments/assets/c2624762-2750-487b-a211-71c60ad63225" />

# Inspiration
Our RUHacks project focuses on a New Brunswick Crime detector system. Due to the state of crime in New Brunswick, people feel that it is unsafe simply to walk the streets. In order to make the community more safe within the New Brunswick ecosystem, a matter which is particularly important for Rutgers students, there needs to be a solution to this issue. This was a strong call to action for our team and was the main reason that we chose to build this product for the Rutgers pedestrians. Ultimately, our hope as a group is that the product helps with the social harmony of all Rutgers students and residents of New Brunswick.

# What it does
We built an application that visualizes crime data in New Brunswick, NJ through a real-time map interface. The users can explore recent crime incidents marked with color-coded icons based on the severity (murder, assault, robbery, etc.), search and filter crimes by type, location, or date range, and view detailed information for each incident.

The app also features a walking route planner that calculates safe pedestrian paths between locations, integrating with an external shortest-path API to display the optimal routes on the map with distance and walking time estimates. People can contribute to community safety by submitting new crime reports through a dedicated form.

# How we built it
We built the New Brunswick Crime Tracker by scraping two months of reported incidents from the public database on the New Brunswick Police Department website. These records were visualized on an interactive map using the Google Maps API, where each crime type is represented with overlaying symbols. The frontend was developed with Next.js and Tailwind CSS for a fast and responsive interface.

For optimal route finding, we used OpenStreetMap data containing New Brunswick’s street network of nodes, vertices, and corresponding weights. Streets with reported crimes were dynamically reweighted—assigning higher penalties to violent incidents—to discourage routing through unsafe areas. The shortest safe path was computed using Dijkstra’s algorithm served through a Flask API tunneled with ngrok.

# Challenges we ran into
One major challenge was scraping data from the New Brunswick Police Department’s website, which lacked a public API and relied on outdated HTML structures. We overcame this by identifying how the site served its data and building a custom Python scraper to parse the returned HTML.

We also faced difficulties fine-tuning Dijkstra’s algorithm for safe route generation. Initially, the algorithm still routed users through unsafe streets because our penalty weights for high-crime areas were too low. After experimenting with stronger weight adjustments for violent crimes, the routes began avoiding those dangerous zones effectively.

# Accomplishments that we're proud of
Our HackRU project consisted of many different challenges, both conceptual and technical. Technical challenges involved syntax and creating the structure of the project. Although these were important, our biggest problems came mostly in terms of conceptual issues regarding how to accomplish the task of creating this application. Firstly, getting crime data was an important issue because it wasn't simply stored in a csv dataset on the internet. To solve the issue we needed to parse html generated from the New Brunswick Police Department's public crime statistics. Afterwards, there was a problem related to how we would display our information, which required careful brainstorming to implement sufficiently. Another problem was getting the street with the best route to load while avoiding the specific streets that had recorded crime. It wasn't as simple as inputting it into a google maps api since there was no option to avoid these streets, so we had to engineer a modified Dijkstra's algorithm and implement our own solution. Overall, although these challenges acted as great obstacles towards our objectives, our ability to mitigate helped showcase our programming prowess.

# What we learned
We learned how to build a full-stack web application using Next.js and Tailwind CSS, integrating it with a Python backend that applied our data structures knowledge—specifically Dijkstra’s algorithm for route optimization. We also gained experience working with the Google Maps API and connecting frontend and backend components seamlessly. Overall, it was a rewarding experience that helped us explore new technologies and strengthen our software engineering skills.

# What's next for New Brunswick Crime Tracker
We plan to expand the platform to other major cities across the country, helping more communities stay informed and navigate safely. To enhance the community-driven reporting system, we aim to introduce an upvote and verification feature that allows users to confirm or dispute crime reports. Verified submissions will be cross-checked with the latest official data from local police databases, ensuring both accuracy and trust in the platform.

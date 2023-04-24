#[Mermaid Microservices erDiagram](https://byosta.github.io/mermaid-microservices-erdiagram/ "#Mermaid Microservices erDiagram")

Project to visualize multiple microservices' entity relationship diagrams in one page, being able to check/uncheck which services you want to see and if you want to show the table detailed by microservice. Also being able to download the [mermaid.js](https://mermaid.js.org/ "mermaid.js") generated image as SVG.

####[DEMO](https://byosta.github.io/mermaid-microservices-erdiagram/)

Show all microservices with table details.
![All expanded diagrams](https://i.imgur.com/qixmcLQ.png)

Show Course Management microservice only.
![Filtered Diagrams](https://i.imgur.com/opMLPF9.png "Filtered Diagrams")

#How to use
1.  Clone project
2. Add all the required `.mmd` files for all your microservices. Define the tables details (columns) whithin the service that it belongs to (Without the integrations between microservices)
3. Add all the integrations (FKs) between microservices on the `allMicroservicesIntegration.mmd` file (For example the union between Student  Reservations or Course-StudenCourse)
4. Deploy the web page. 
   
(If you are using GitHub Pages for example and the directory `/microservices` does not show all files with a GET call... You can modify the `/microservices/index.html` to add all files required. (On local this `index.html` can be removed))

####TODO
- Add Download as PNG.
- Set all API calls to be configurable.

###DISCLAIMER

This project was originally developed as a local solution. It can be run by cloning it and opening it on VS Code using the [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer "Live Server Extension")

For it being deployed onto GitHub Pages a new `index.html` file was added into `/microservices` subdirectory adding as well all the `.mmd` files in a JSON array. 

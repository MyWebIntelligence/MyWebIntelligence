# Graph tests

These tests act as if the web was crawled and stored in the db. They verify the resulting graph matches expectations.


## Tests

1) no url
    => (0, 0) graph

2) /end/1
    => (1, 0) graph
    
3) /1?status=404
    => (0, 0) graph

4) /1 --301--> /end/2
    => (1, 0) graph with /2

5) /1 --301--> /2 --301--> /end/3
    => (1, 0) graph with /3

6) /end/1, /end/2
    => (2, 0) graph

7) /1 -> /end/2
    => (2, 1)
    
8) /2 <-> /3 graph
    => (2, 2)
    
9) /4 -> /1 --301--> /end/2
    => (2, 1) graph (the second node is /end/2)

10) /5 -> /end/6 , /5 -> /end/7
    => (3, 2) graph 

11) /1 -> /2 -> /end/3
    => (3, 2) graph






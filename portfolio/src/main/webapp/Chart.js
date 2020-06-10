
let Chart = class {

    constructor(){} // Empty for now
    
    /** Creates a chart and adds it to the page. */
    drawChart() {
        console.log("here2");
        console.log(google.visualization);
        console.log(google.visualization.DataTable);
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Animal');
        data.addColumn('number', 'Count');
                data.addRows([
                ['Lions', 10],
                ['Tigers', 5],
                ['Bears', 15]
                ]);

        const options = {
            'title': 'Zoo Animals',
            'width':500,
            'height':400
        };

        const chart = new google.visualization.PieChart(
            document.getElementById('chart-container'));
        chart.draw(data, options);
    }

    drawBarChart(){
        var data = google.visualization.arrayToDataTable([
          ['Sport', 'Sales', 'Expenses', 'Profit'],
          ['2014', 1000, 400, 200],
          ['2015', 1170, 460, 250],
          ['2016', 660, 1120, 300],
          ['2017', 1030, 540, 350]
        ]);

        var options = {
          chart: {
            title: 'Company Performance',
            subtitle: 'Sales, Expenses, and Profit: 2014-2017',
            width: window.innerWidth,
          }
        };

        var chart = new google.charts.Bar(document.getElementById("columnchart_material"));

        chart.draw(data, google.charts.Bar.convertOptions(options));
    }

}



let Chart = class {

    constructor(){} // Empty for now
    
    /** Creates a chart and adds it to the page. */
    drawChart() {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Animal');
        data.addColumn('number', 'Count');
                data.addRows([
                ['Blue', 10],
                ['Tigers', 5],
                ['Orange', 15]
                ]);

        const options = {
            'title': 'Zoo Animals',
        };

        const chart = new google.visualization.PieChart(
            document.getElementById('chart-container'));
        chart.draw(data, options);
    }

    drawBarChart(){
        var data = google.visualization.arrayToDataTable([
          ['Sport', 'Sales', 'Expenses'],
          ['2014', 1000, 400],
          ['2015', 1170, 460],
          ['2016', 660, 1120],
          ['2017', 1030, 540]
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


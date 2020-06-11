

let Chart = class {

    constructor(){} // Empty for now
    
    /** Creates a chart and adds it to the page. */
    drawChart() {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Animal');
        data.addColumn('number', 'Count');
                data.addRows([
                ['Hip-Hop/Rap', 20],
                ['Country', 5],
                ['Pop', 15],
                ['Rock', 8],
                ['Classical', 12],
                ['R&B', 6]
                ]);

        const options = {
        };

        const chart = new google.visualization.PieChart(
            document.getElementById('chart-container'));
        chart.draw(data, options);
    }
}


document.addEventListener("DOMContentLoaded", function() {
  const data = window.sae303Data;

  // Palette cohérente avec ta DA
  const primary = "#4A235A";
  const primaryLight = "rgba(74, 35, 90, 0.1)";
  const accent = "rgb(228, 219, 237)";
  const foreground = "rgb(54, 44, 55)";

  function getVioletGradient(dataArr) {
    const min = Math.min(...dataArr.filter(v => v !== null));
    const max = Math.max(...dataArr.filter(v => v !== null));
    return dataArr.map(val => {
      const percent = (val - min) / (max - min || 1);
      const r = Math.round(228 + (74 - 228) * percent);
      const g = Math.round(219 + (35 - 219) * percent);
      const b = Math.round(237 + (90 - 237) * percent);
      return `rgb(${r},${g},${b})`;
    });
  }

  function getLabelColors(barColors) {
    // Retourne blanc si la barre est foncée, violet foncé sinon
    return barColors.map(rgb => {
      // Extraire la luminosité de la couleur
      const match = rgb.match(/\d+/g);
      if (!match) return "#4A235A";
      const [r, g, b] = match.map(Number);
      // Calcul de la luminosité perçue
      const luminance = 0.299*r + 0.587*g + 0.114*b;
      return luminance < 140 ? "#fff" : "#4A235A";
    });
  }

  // ----------- 1. Femmes managers -----------
  const lastManagerIdx = data.managerYears ? data.managerYears.length - 1 : null;
  if (lastManagerIdx !== null && data.manager) {
    const managerBarData = data.countries.map(country => {
      const arr = data.manager[country];
      return arr ? arr[lastManagerIdx] : null;
    });
    const managerBarColors = getVioletGradient(managerBarData);
    const managerLabelColors = getLabelColors(managerBarColors);
    const managerBarOptions = {
      chart: {
        type: 'bar',
        height: 400,
        toolbar: { show: false },
        fontFamily: 'Segoe UI, Arial, sans-serif',
        foreColor: primary,
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        events: {
          dataPointSelection: function(event, chartContext, config) {
            const country = data.countries[config.dataPointIndex];
            showManagerDetail(country);
          }
        }
      },
      colors: managerBarColors,
      plotOptions: {
        bar: {
          borderRadius: 12,
          columnWidth: '55%',
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: val => val !== null ? val + " %" : "",
        style: { colors: managerLabelColors, fontWeight: 700 }
      },
      grid: {
        borderColor: accent,
        strokeDashArray: 4
      },
      series: [{ name: "Managers (dernier)", data: managerBarData }],
      xaxis: {
        categories: data.countries,
        labels: { style: { colors: primary, fontWeight: 600 } }
      },
      yaxis: {
        labels: { style: { colors: primary, fontWeight: 600 } }
      },
      title: {
        text: "Femmes aux postes managériaux (% de femmes, année la plus récente)",
         margin: 25,
        style: { color: primary, fontWeight: 700, fontSize: '1.1rem' }
      }
    };
    const managerBarChart = new ApexCharts(document.querySelector("#manager-chart"), managerBarOptions);
    managerBarChart.render();

    function showManagerDetail(country) {
      const values = data.manager[country];
      const options = {
        chart: {
          type: 'line',
          height: 300,
          toolbar: { show: false },
          fontFamily: 'Segoe UI, Arial, sans-serif',
          foreColor: primary,
          animations: { enabled: true, easing: 'easeinout', speed: 800 },
        },
        colors: [primary],
        stroke: { width: 4, curve: 'smooth' },
        markers: {
          size: 6,
          colors: [accent],
          strokeColors: primary,
          strokeWidth: 3
        },
        dataLabels: {
          enabled: true,
          formatter: val => val !== null ? val + " %" : "",
          style: { colors: [primary], fontWeight: 700 }
        },
        grid: {
          borderColor: accent,
          strokeDashArray: 4
        },
        series: [{ name: country, data: values }],
        xaxis: {
          categories: data.managerYears,
          labels: { style: { colors: primary, fontWeight: 600 } }
        },
        yaxis: {
          labels: { style: { colors: primary, fontWeight: 600 } }
        },
        title: {
          text: `Évolution managers pour ${country} (% de femmes)`,
           margin: 25,
          style: { color: primary, fontWeight: 700, fontSize: '1.1rem' }
        }
      };
      document.querySelector("#manager-detail").innerHTML = "";
      new ApexCharts(document.querySelector("#manager-detail"), options).render();
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          managerBarChart.updateOptions({}, true, true);
        }
      });
    });
    observer.observe(document.querySelector('#manager-detail'));
  }

  // ----------- 2. Salary gap -----------
  const lastSalaryIdx = data.salaryYears ? data.salaryYears.length - 1 : null;
  if (lastSalaryIdx !== null && data.salaryGap) {
    const salaryBarData = data.countries.map(country => {
      const arr = data.salaryGap[country];
      return arr ? arr[lastSalaryIdx] : null;
    });

    const salaryBarColors = getVioletGradient(salaryBarData);
    const salaryLabelColors = getLabelColors(salaryBarColors);

    const salaryBarOptions = {
      chart: {
        type: 'bar',
        height: 400,
        toolbar: { show: false },
        fontFamily: 'Segoe UI, Arial, sans-serif',
        foreColor: primary,
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        events: {
          dataPointSelection: function(event, chartContext, config) {
            const country = data.countries[config.dataPointIndex];
            showSalaryDetail(country);
          }
        }
      },
      colors: salaryBarColors,
      plotOptions: {
        bar: {
          borderRadius: 12,
          columnWidth: '55%',
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: val => val !== null ? val.toFixed(2) : "",
        style: { colors: salaryLabelColors, fontWeight: 700 }
      },
      grid: {
        borderColor: accent,
        strokeDashArray: 4
      },
      series: [{ name: "Salary gap (dernier)", data: salaryBarData }],
      xaxis: {
        categories: data.countries,
        labels: { style: { colors: primary, fontWeight: 600 } }
      },
      yaxis: {
        labels: { style: { colors: primary, fontWeight: 600 } }
      },
      title: {
        text: "Gender salary gap (ratio femmes/hommes, année la plus récente)",
         margin: 25,
        style: { color: primary, fontWeight: 700, fontSize: '1.1rem' }
      }
    };
    const salaryBarChart = new ApexCharts(document.querySelector("#salary-chart"), salaryBarOptions);
    salaryBarChart.render();

    function showSalaryDetail(country) {
      const values = data.salaryGap[country];
      const options = {
        chart: {
          type: 'line',
          height: 400,
          toolbar: { show: false },
          fontFamily: 'Segoe UI, Arial, sans-serif',
          foreColor: primary,
          animations: { enabled: true, easing: 'easeinout', speed: 800 },
        },
        colors: [primary],
        stroke: { width: 4, curve: 'smooth' },
        markers: {
          size: 6,
          colors: [accent],
          strokeColors: primary,
          strokeWidth: 3
        },
        dataLabels: {
          enabled: true,
          formatter: val => val !== null ? val.toFixed(2) : "",
          style: { colors: [primary], fontWeight: 700 }
        },
        grid: {
          borderColor: accent,
          strokeDashArray: 4
        },
        series: [{ name: country, data: values }],
        xaxis: {
          categories: data.salaryYears,
          labels: { style: { colors: primary, fontWeight: 600 } }
        },
        yaxis: {
          labels: { style: { colors: primary, fontWeight: 600 } }
        },
        title: {
          text: `Évolution salary gap pour ${country} (ratio)`,
           margin: 25,
          style: { color: primary, fontWeight: 700, fontSize: '1.1rem' }
        }
      };
      document.querySelector("#salary-detail").innerHTML = "";
      new ApexCharts(document.querySelector("#salary-detail"), options).render();
    }
  }

  // ----------- 3. Femmes au parlement -----------
  const lastParliamentIdx = data.years.length - 1;
  const parliamentBarData = data.countries.map(country => {
    const arr = data.parliament[country];
    return arr ? arr[lastParliamentIdx] : null;
  });
  const parliamentBarColors = getVioletGradient(parliamentBarData);
  const parliamentLabelColors = getLabelColors(parliamentBarColors);

  const parliamentBarOptions = {
    chart: {
      type: 'bar',
      height: 400,
      toolbar: { show: false },
      fontFamily: 'Segoe UI, Arial, sans-serif',
      foreColor: primary,
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          const country = data.countries[config.dataPointIndex];
          showParliamentDetail(country);
        }
      }
    },
    colors: parliamentBarColors,
    plotOptions: {
        bar: {
          borderRadius: 12,
          columnWidth: '55%',
          distributed: true
        }
      },
    dataLabels: {
      enabled: true,
      formatter: val => val !== null ? val + " %" : "",
      style: { colors: parliamentLabelColors, fontWeight: 700 }
    },
    grid: {
      borderColor: accent,
      strokeDashArray: 4
    },
    series: [{ name: "Parlement (dernier)", data: parliamentBarData }],
    xaxis: {
      categories: data.countries,
      labels: { style: { colors: primary, fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: primary, fontWeight: 600 } }
    },
    title: {
      text: "Femmes au parlement (% de sièges occupés, 2024)",
       margin: 25,
      style: { color: primary, fontWeight: 700, fontSize: '1.1rem' }
    }
  };
  const parliamentBarChart = new ApexCharts(document.querySelector("#parliament-chart"), parliamentBarOptions);
  parliamentBarChart.render();

  function showParliamentDetail(country) {
  const values = data.parliament[country];
  const options = {
    chart: {
      type: 'line',
      height: 400,
      toolbar: { show: false },
      fontFamily: 'Segoe UI, Arial, sans-serif',
      foreColor: primary,
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    colors: [primary],
    stroke: { width: 4, curve: 'smooth' },
    markers: {
      size: 6,
      colors: [accent],
      strokeColors: primary,
      strokeWidth: 3
    },
    dataLabels: {
      enabled: true,
      formatter: val => val !== null ? val + " %" : "",
      style: { colors: [primary], fontWeight: 700 }
    },
    grid: {
      borderColor: accent,
      strokeDashArray: 4
    },
    series: [{ name: country, data: values }],
    xaxis: {
      categories: data.years,
      labels: { style: { colors: primary, fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: primary, fontWeight: 600 } }
    },
    title: {
      text: `Évolution parlement pour ${country} (% de femmes)`,
       margin: 25,
      style: { color: primary, fontWeight: 700, fontSize: '1.1rem' }
    }
  };

  document.querySelector("#parliament-detail").innerHTML = "";
  new ApexCharts(document.querySelector("#parliament-detail"), options).render();
}
});


document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".chapter");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (navLink) {
          navLinks.forEach((link) => link.classList.remove("active"));
          navLink.classList.add("active");
        }
      }
    });
  },
  { threshold: 0.3 } // ✅ Moins exigeant
);
  sections.forEach((section) => observer.observe(section));
});

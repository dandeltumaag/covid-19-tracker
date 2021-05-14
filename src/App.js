import React, { useState, useEffect } from "react"
import {
  MenuItem,
  FormControl,
  Select,
	Card,
	CardContent
} from "@material-ui/core"
import InfoBox from './components/InfoBox'
import Map from './components/Map'
import Table from './components/Table'
import LineGraph from './components/LineGraph'


/* UTILITIES */
import { sortData, prettyPrintStat } from './util'

/* CSS */
import './App.css'
import "leaflet/dist/leaflet.css"

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
	const [countryInfo, setCountryInfo] = useState({})
	const [tableData, setTableData] = useState([])
	const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796})
	const [mapZoom, setMapZoom] = useState(3)
	const [mapCountries, setMapCountries] = useState([])
	const [casesType, setCasesType] = useState("cases")
	const [isLoading, setLoading] = useState(false)

	useEffect( () => {
		fetch('https://disease.sh/v3/covid-19/all')
		.then( (response) => response.json() )
		.then( (data) => {
			setCountryInfo(data)
		} )
	}, [] )

  // API - https://disease.sh/v3/covid-19/countries
  // useEffect = runs a piece of code based on a given condition 
  // async = send a request, wait for it, do something with the data
  useEffect( () => {
    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then ( (response) => response.json())
      .then ( (data) => {
        const countries = data.map( (country) => (
          {
            name: country.country, // United States, India
            value: country.countryInfo.iso2, // US, IN, FR
          }
        ))
				
				const sortedData = sortData(data);
				setTableData(sortedData)
				setMapCountries(data)
        setCountries(countries)
      }) 
    }
    getCountriesData()
  }, [])

  const onCountryChange = async( event ) => {
		setLoading(true)
    const countryCode = event.target.value
    setCountry(countryCode)

		const url = countryCode === "worldwide" ? 
			"https://disease.sh/v3/covid-19/all" :
			`https://disease.sh/v3/covid-19/countries/${countryCode}`

		await fetch(url)
		.then( (response) => response.json())
		.then( (data) => {
			setCountry(countryCode)
			setCountryInfo(data)
			setLoading(false)
			countryCode === "worldwide"
				? setMapCenter([34.80746, -40.4796])
				: setMapCenter([data.countryInfo.lat, data.countryInfo.long]); 
			setMapZoom(4)			
		})
	}

  return (
    <div className="app">
			<div className="app__left">
				<div className="app__header">
				<h1>COVID-19 Tracker</h1>
					<FormControl className="app__dropdown">
						<Select 
							variant="outlined" 
							onChange={onCountryChange} 
							value={country} 
						>
							<MenuItem value="worldwide">Worldwide</MenuItem>
							{
								countries.map( (country) => (
									<MenuItem value={country.value}>{country.name}</MenuItem>
								)) 
							}
						</Select>
					</FormControl>
				</div>

				<div className="app__stats">
					<InfoBox
						isRed
						active={casesType === "cases"}
						className="infoBox__cases"
						onClick={ (e) => setCasesType("cases") }
						title="Corona Virus Cases" 
						cases={prettyPrintStat(countryInfo.todayCases)} 
						total={prettyPrintStat(countryInfo.cases)}
						isloading={isLoading}
					/>
					<InfoBox
						active={casesType === "recovered"}
						className="infoBox__recovered"
						onClick={ (e) => setCasesType("recovered") } 
						title="Recovered" 
						cases={prettyPrintStat(countryInfo.todayRecovered)} 
						total={prettyPrintStat(countryInfo.recovered)}
						isloading={isLoading}
					/>
					<InfoBox
						isGrey
						active={casesType === "deaths"}
						className="infoBox__deaths"
						onClick={ (e) => setCasesType("deaths") }
						title="Deaths" 
						cases={prettyPrintStat(countryInfo.todayDeaths)} 
						total={prettyPrintStat(countryInfo.deaths)}
						isloading={isLoading}
					/>
				</div>

				<Map
					casesType={casesType}
					countries={mapCountries}
					center={mapCenter}
					zoom={mapZoom}
				/>

			</div>

			<Card className="app__right">
				<CardContent>
					<h3>Live Cases by Country</h3>
					<Table countries={tableData} />
					<h3 className="app__graphTitle">Worldwide new {casesType}</h3>
					<LineGraph className="app__graph" casesType={casesType} />
				</CardContent>
      {/* Graph */}
			</Card>
    </div>
  );
}

export default App;
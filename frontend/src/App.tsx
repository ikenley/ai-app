import { useState, useEffect } from "react"; 
import axios from "axios"
import config from "./config"

function App() {
  const [apiInfo, setApiInfo] = useState<object|null>(null)

  useEffect(() => {
    const getApiInfo = async () => {
      const res = await axios.get(`${config.apiPrefix}/status/info`)
      console.log("res", res)
      setApiInfo(res.data)
    }
    getApiInfo()

    console.log(`VERSION`, config.version)
  }, [setApiInfo])

  return (
    <div className="ai-app">
      <header className="App-header"></header>
      <div className="container">
        <p>Open the pod bay doors, HAL.</p>
        <div>API info:</div>
        {apiInfo ? <div>{JSON.stringify(apiInfo)}</div> : null}
      </div>
    </div>
  );
}

export default App;

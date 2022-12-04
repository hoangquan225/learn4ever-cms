import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LayoutDefault from './components/layouts/DefaultLayout';
import routes from './pages/routes';

function App() {
  return (
    <Router>
      <LayoutDefault>
      <Suspense fallback={<div></div>}>
        <Routes>
          {routes.map(({component : Component, path,label, ...rest}, index) => {
            return (
              <Route element = {<Component />} key={index} path = {path} {...rest}/>
            )
          })}
        </Routes>
        </Suspense>
      </LayoutDefault>
    </Router>
  );
}

export default App;

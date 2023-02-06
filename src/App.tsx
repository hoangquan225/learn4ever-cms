import { Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import LayoutDefault from './components/layouts/DefaultLayout';
import CourseDetail from './pages/courseDetail';
import LoginPages from './pages/login';
import routes from './pages/routes';

function App() {
  return (
    <Router>
      <LayoutDefault>
        <Suspense fallback={<div></div>}>
          <Routes>
            {[
              <Route element = {<CourseDetail />} key={'course-detail'} path = {"/course/chi-tiet-khoa-hoc/:slug"} />
              ,<Route element = {<LoginPages />} key={'login'} path = {"/dang-nhap"} />
              ,...routes.map(({component : Component, path,label, ...rest}, index) => {
                return (
                  <Route element = {
                  // <Component />
                  false ? <Component /> : <Navigate to={"/dang-nhap"} />
                } key={index} path = {path} {...rest}/>
                )
              })
            ]}
          </Routes>
        </Suspense>
      </LayoutDefault>
    </Router>
  );
}

export default App;

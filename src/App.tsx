import { LoadingOutlined } from '@ant-design/icons';
import { Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import LayoutDefault from './components/layouts/DefaultLayout';
import PrivateRoute from './components/PrivateRoute';
import CourseDetail from './pages/courseDetail';
import LoginPages from './pages/login';
import routes from './pages/routes';
import { useAxios } from './api/config';

function App() {
  function L4EHooks() {
    useAxios()
    return null
  }

  return (
    <Router>
      <L4EHooks />
      <Suspense fallback={<LoadingOutlined />}>
        <Routes>
          <Route element={<LoginPages />} key={'login'} path={"/dang-nhap"} />
          <Route path='/' element={<PrivateRoute />}>
            {[
              <Route element={<LayoutDefault><CourseDetail /></LayoutDefault>} key={'course-detail'} path={"/course/chi-tiet-khoa-hoc/:slug"} />
              , ...routes.map(({ component: Component, path, label, ...rest }, index) => {
                return (
                  <Route element={
                    <LayoutDefault>
                      <Component />
                    </LayoutDefault>
                  } key={index} path={path} {...rest} />
                )
              })
            ]}
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

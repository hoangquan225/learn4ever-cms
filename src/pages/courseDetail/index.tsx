import { useLocation } from 'react-router-dom';

const CourseDetail = () => {

  const location = useLocation();
  console.log('pathname', location.pathname);
  
  return <>
    khoa hoc chi tiet
    <div></div>
  </>
}

export default CourseDetail
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const CourseDetail = () => {

  const params = useParams();

  useEffect(() => {
    console.log(params.slug);
    
    // call api get topic by id
  }, [params.slug])
  
  return <>
    khoa hoc chi tiet
    <div></div>
  </>
}

export default CourseDetail
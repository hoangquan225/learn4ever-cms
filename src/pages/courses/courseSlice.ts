import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../redux/store'
import { Course } from '../../submodule/models/course'
import { apiLoadByIdTagAndCategory, apiLoadCourseById, apiLoadCourses, apiLoadCoursesByIdCategory, apiUpdateCourse } from '../../api/courseApi'

// Define a type for the slice state
interface CourseState {
  courses: Course[],
  loading: boolean,
  error: string,
  courseInfo: Course | null
}

// Define the initial state using that type
const initialState: CourseState = {
  courses: [],
  loading: false,
  error: '',
  courseInfo: null
}

export const requestLoadCourses = createAsyncThunk('course/loadCourses', async (props: { status: number }) => {
  const res = await apiLoadCourses(props);
  return res.data
})

export const requestLoadCourseById = createAsyncThunk('course/requestLoadCourseById', async (props: { id: string }) => {
  const res = await apiLoadCourseById(props);
  return res.data
})

export const requestLoadCoursesByIdCategory = createAsyncThunk('course/loadCoursesByIdCategory', async (props: {idCategory:string, status: number }) => {
  const res = await apiLoadCoursesByIdCategory(props);
  return res.data
})

export const requestLoadByIdTagAndCategory = createAsyncThunk('course/loadByIdTagAndCategory', async (props: {idCategory:string, idTag:string, status?: number }) => {
  const res = await apiLoadByIdTagAndCategory(props);
  return res.data
})


export const requestUpdateCourse = createAsyncThunk('course/updateCourse', async (props: Course) => {
  const res = await apiUpdateCourse(props);
  return res.data
})

export const courseSlice = createSlice({
  name: 'course',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setCourseInfo: (state, action) => {
      state.courseInfo = action.payload
    }
  },
  extraReducers: (builder) => {
    const actionList = [requestLoadCourses, requestUpdateCourse, requestLoadCoursesByIdCategory, requestLoadByIdTagAndCategory, requestLoadCourseById];
    actionList.forEach(action => {
      builder.addCase(action.pending, (state) => {
        state.loading = true;
      })
    })
    actionList.forEach(action => {
      builder.addCase(action.rejected, (state) => {
        state.loading = false;
      })
    })

    // load 
    builder.addCase(requestLoadCourses.fulfilled, (state, action: PayloadAction<{
      data: Course[],
      status: number
    }>) => {
      state.loading = false;
      state.courses = action.payload.data?.map((o) => new Course(o));
    })
    
    // load bby id 
    builder.addCase(requestLoadCourseById.fulfilled, (state, action: PayloadAction<{
      data: any,
      status: number
    }>) => {
      state.loading = false;
      state.courseInfo = new Course(action.payload.data)
    })
    

    // load by id category
    builder.addCase(requestLoadCoursesByIdCategory.fulfilled, (state, action: PayloadAction<{
      data: Course[],
      status: number
    }>) => {
      state.loading = false;
      state.courses = action.payload.data?.map((o) => new Course(o));
    })
    
    // load by id category
    builder.addCase(requestLoadByIdTagAndCategory.fulfilled, (state, action: PayloadAction<{
      data: Course[],
      status: number
    }>) => {
      state.loading = false;
      state.courses = action.payload.data?.map((o) => new Course(o));
    })

    // update
    builder.addCase(requestUpdateCourse.fulfilled, (state, action: PayloadAction<{
      data: Course,
      status: number
    }>) => {
      state.loading = false;
      state.courseInfo = new Course(action.payload.data)
    })
  }
})

export const { setCourseInfo } = courseSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const courseState = (state: RootState) => state.course

export default courseSlice.reducer
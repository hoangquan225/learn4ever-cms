import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../redux/store'
import { Category } from '../../submodule/models/category'
import { apiLoadCategorys } from '../../api/categoryApi'

// Define a type for the slice state
interface CategoryState {
  categorys : Category[],
  loading: boolean, 
  error: string, 
  categoryInfo: Category | null
}

// Define the initial state using that type
const initialState: CategoryState = {
  categorys: [], 
  loading: false, 
  error: '', 
  categoryInfo: null
}

export const requestLoadCategorys = createAsyncThunk('category/loadCategorys', async (props: { status: number }) => {
  const res = await apiLoadCategorys(props);
  return res.data
})

export const categorySlice = createSlice({
  name: 'category',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    const actionList = [requestLoadCategorys];
    actionList.forEach(action => {
        builder.addCase(action.pending, (state) => {
            state.loading = true;
        })
    })

    // load 
    builder.addCase(requestLoadCategorys.fulfilled, (state, action: PayloadAction<{
      data:Category[], 
      status: number
    }>) => {
      state.loading = false;
      state.categorys = action.payload.data;
  })
  }
})

export const { } = categorySlice.actions

// Other code such as selectors can use the imported `RootState` type
export const categoryState = (state: RootState) => state.category

export default categorySlice.reducer
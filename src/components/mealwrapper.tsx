import MealCard from './mealcard'
import CategoryFilter from './mealfilter'
import {useState, useEffect} from 'react'


const mealCategoriesLink:string = 'https://www.themealdb.com/api/json/v1/1/categories.php'

interface mealCategoriesJSON {
  categories : [{
      readonly strCategory : string
  }]
}

interface typeFilterArrays {
    readonly yes : string[]
    readonly no : string[]
}

const generateCategories = async function():Promise<mealCategoriesJSON | undefined> {
  try{
      const response = await fetch(mealCategoriesLink, {mode:'cors'})
      const mealCat = await response.json()
      return mealCat

  }
  catch(error){
      console.log(error)
      return
  }
}

const filterList = async function():Promise<string[] | void>{
  const categoriesObject = await generateCategories()
  let mealCategories:string[] = []
  if(categoriesObject){
      for(let category of categoriesObject['categories']){
          mealCategories = [...mealCategories, category.strCategory]
      }
      return mealCategories
  }
  
}


const MealWrapper = function(): JSX.Element{
    let [typeFilter,setTypeFilter] = useState<typeFilterArrays>({
        yes: [],
        no : []
    })

    let populateFilter = async function(){
        const mealTypes = await filterList()
        if(mealTypes){
            setTypeFilter(
                {
                    yes : [...mealTypes],
                    no : []
                }
            )

        }              
    }

    useEffect(()=>{
        populateFilter()
    },[typeFilter])

    return (
        <div>
            <CategoryFilter/>
            <MealCard/>
        </div>
    )

}

export default MealWrapper
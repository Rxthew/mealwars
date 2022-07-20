import CategoryFilter from './mealfilter'
import {v4 as genKey} from 'uuid'
import {MainMealCard, MealCard} from './mealcard'
import {useState, useEffect} from 'react'


const mealCategoriesLink:string = 'https://www.themealdb.com/api/json/v1/1/categories.php'

interface mealCategoriesJSON {
  categories : [{
      readonly strCategory : string
  }]
}

export interface typeFilterObject {
     [index: string] : 'yes' | 'no'
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

    let [typeFilter,setTypeFilter] = useState<typeFilterObject>({})

    useEffect(()=> {

        let populateFilter = async function(){
            const mealTypes = await filterList()
            if(mealTypes){
                let mealTypesObject:typeFilterObject = {}
                for(let elem of mealTypes){
                    mealTypesObject[`${elem}`] = 'yes'
                }
                setTypeFilter(mealTypesObject)
            }              
        }
        populateFilter()
    },[])
    
    const newRandom = function(){
        setRandomCard(
            <MealCard id={genKey()} filterObject={typeFilter} mainHandleFunction={randomCard.props.mainHandleFunction}/>
        )
    }

    const newMain = function(reserveData:JSX.Element){
        setMainCard(
            <MainMealCard id={genKey()} cardData={reserveData} filterObject={typeFilter} mainHandleFunction={mainCard.props.mainHandleFunction}/>
        )

    }

    const promoteToMain = function(reserveData:JSX.Element){
        newRandom()
        newMain(reserveData)
    }
  
    let [mainCard, setMainCard] = useState<JSX.Element>(<MainMealCard id={genKey()} cardData={<div id='new'></div>} filterObject={typeFilter} mainHandleFunction={newRandom}/>)
    let [randomCard, setRandomCard] = useState<JSX.Element>(<MealCard id={genKey()} filterObject={typeFilter} mainHandleFunction={promoteToMain}/>)
    let [score, setScore] = useState<number>(0)

    useEffect(()=>
    {
        setScore(s => ++s)
    },[randomCard])

    useEffect(()=>{
        setScore(0)
    },[mainCard])


    return (
        <div>
            <CategoryFilter filterObject={typeFilter} setFilterObject={setTypeFilter}/>
            {mainCard}
            {randomCard}
            <span>{score}</span>
        </div>
    )

}

export default MealWrapper
import CategoryFilter from './mealfilter'
import {v4 as genKey} from 'uuid'
import {MainMealCard, MealCard} from './mealcard'
import {useState, useEffect, useRef} from 'react'




const mealCategoriesLink:string = 'https://www.themealdb.com/api/json/v1/1/categories.php'

interface mealCategoriesJSON {
  categories : [{
      readonly strCategory : string
  }]
}

export interface typeFilterObject {
     [index: string] : 'yes' | 'no'
}

let currentAbort: AbortController | null = null


const generateCategories = async function():Promise<mealCategoriesJSON | undefined> {
  try{
    const abortControl = new AbortController()
    currentAbort = abortControl
    const abortSignal = abortControl.signal  
      const response = await fetch(mealCategoriesLink, {mode:'cors',signal: abortSignal})
      const mealCat = await response.json()
      return mealCat

  }
  catch(error){
    let e = error as Error
    if(e.message === 'The operation was aborted. '){
        return
    }
    else{
        console.log(error)
    }
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
    let latestFilter: {current: typeFilterObject | undefined}= useRef()

    useEffect(()=> {

        const populateFilter = async function(){
            const mealTypes = await filterList()
            if(mealTypes){
                let mealTypesObject:typeFilterObject = {}
                mealTypes.map(elem => mealTypesObject[`${elem}`] = 'yes')
                setTypeFilter(mealTypesObject)
                latestFilter.current = mealTypesObject
            }              
        }
        populateFilter()

        return () => {
                currentAbort?.abort()
        }
    },[])
    

    const refreshMain = function(reserveData:JSX.Element,newMainName:string){
        let currentFilter = latestFilter.current ? latestFilter.current : typeFilter
        if(reserveData){
            setMainCard( m=> <MainMealCard id={genKey()} cardData={reserveData} filterObject={currentFilter} mainHandleFunction={m.props.mainHandleFunction} mainName={newMainName}/>)  

        }
        setTimeout(function(){
            newRandom()
        },1000)
        
    }
    
    const newRandom = function(){
        let currentFilter = latestFilter.current ? latestFilter.current : typeFilter
        setRandomCard( r =>
            <MealCard id={genKey()} filterObject={currentFilter} mainHandleFunction={r.props.mainHandleFunction}/>
        )
    }

    const newMain = function(reserveData:JSX.Element,newMainName:string){
        let currentFilter = latestFilter.current ? latestFilter.current : typeFilter
        setMainCard( m =>
            <MainMealCard id={genKey()} cardData={reserveData} filterObject={currentFilter} mainHandleFunction={m.props.mainHandleFunction} mainName={newMainName}/>
        )

    }

    const promoteToMain = function(reserveData:JSX.Element, newMainName:string){
        newRandom()
        newMain(reserveData,newMainName)
    }
    
  
    let [mainCard, setMainCard] = useState<JSX.Element>(<MainMealCard id={genKey()} cardData={<div id='new'></div>} filterObject={typeFilter} mainHandleFunction={refreshMain}/>)
    let [randomCard, setRandomCard] = useState<JSX.Element>(<MealCard id={genKey()} filterObject={typeFilter} mainHandleFunction={promoteToMain}/>)
    let [score, setScore] = useState<number>(0)

    useEffect(()=>
    {
        setScore(s => ++s)
    },[randomCard])

    useEffect(()=>{
        setScore(0)
    },[mainCard])

    useEffect(()=>{
       latestFilter.current = typeFilter
        setRandomCard( r =>
            <MealCard id={genKey()} filterObject={typeFilter} mainHandleFunction={r.props.mainHandleFunction}/>
        )
        setMainCard(m => <MainMealCard id={genKey()} cardData={<div id='new'></div>} filterObject={typeFilter} mainHandleFunction={m.props.mainHandleFunction}/>)

    },[typeFilter])

    if(score > 4){ 
        return(
            <main>
                <h2>Looks like you have a winner!</h2>
                {mainCard.props.cardData}
            </main>
        )
    }
    return (
        <main>
            <section>
                <div>
                    <h3>Food Categories:</h3>
                    <h4>Before you start, tap to choose the food categories that you do not want to apply.</h4>
                </div>    
                <CategoryFilter filterObject={typeFilter} setFilterObject={setTypeFilter}/>
            </section>
            <section>
                <div>
                    <h3>Which meal do you prefer?</h3>
                    <h4>First meal to win five rounds wins!</h4>
                </div>
                <div>
                    <p>Current Score:</p>
                    <span>{score}</span>
                </div>
                <div>
                    <h4>Leader:</h4>
                    {mainCard}
                </div>
                <div>
                <h4>Challenger:</h4>
                {randomCard}
                </div>        
            </section>
        </main>
    )

}

export default MealWrapper
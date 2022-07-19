import {useState, useEffect} from 'react'
import { typeFilterObject } from './mealwrapper'


const mealDbLink:string = 'https://www.themealdb.com/api/json/v1/1/random.php' 

interface mealDbJSON {
    meals : {
        0 : {
            readonly strCategory: string,
            readonly strMeal: string,
            readonly strSource: string,
            readonly strMealThumb: string
        }
    }
    
}

interface mealData {
    readonly name: string,
    readonly source : string,
    readonly thumb : string

}

interface cardProps {
    filterObject : typeFilterObject
    mainMakeFunction(): void

}

interface makerProps {
    reserve : JSX.Element
    mainMaker():void
}

const generateMeal = async function():Promise<mealDbJSON | undefined> {
    try{
        const response = await fetch(mealDbLink, {mode:'cors'})
        const mealData = await response.json()
        return mealData

    }
    catch(error){
        console.log(error)
        return
    }
}



const validateMealData = async function(filterObj:typeFilterObject):Promise<mealData | undefined> {
    const filterArrayKeys = Object.keys(filterObj).filter(elem => filterObj[elem] === 'no')
    for(let count = 0; count < 30; count++){
        let currentMeal = await generateMeal()
        if(currentMeal){
            const category = currentMeal.meals[0].strCategory 
            if(filterArrayKeys.includes(category)){
                continue
            }
            let mealObj:mealData =  {
                name: currentMeal.meals[0].strMeal,
                source: currentMeal.meals[0].strSource,
                thumb: currentMeal.meals[0].strMealThumb
            } 
            let mealValues:string[] = Object.values(mealObj)
            if(mealValues.every(str => typeof str === 'string' && str.length > 0 )){  
                return mealObj
            }
        }
        else{
            break
        }
    }
    return
}

const MainMake = function(props:makerProps){
    return(
        <button onClick={() => {props.mainMaker()}}></button>
    )
}



const MealCard = function(props:cardProps):JSX.Element{ 
    const [meal,setMeal] = useState<JSX.Element>(<div>Loading...</div>)
    
    useEffect(() => {
        const singleRandomMeal  = async function():Promise<void>{
            const mealData = await validateMealData(props.filterObject)
            if(mealData){
                setMeal(
                    <div>
                        <li>{mealData.name}</li>
                        <li>{mealData.source}</li>
                        <li><img src={mealData.thumb} alt='meal img'/></li>
                    </div>
                )
            }
            else {
                setMeal(
                    <div>
                        No meals available at the moment. Please try refreshing your browser window.
                    </div>
                )
            }    
                
            
        }
        singleRandomMeal()
        
    },[props.filterObject])

    return (
    <div>      
    {meal}
    <MainMake reserve={meal} mainMaker={props.mainMakeFunction}/> 
    </div>)

}



export default MealCard


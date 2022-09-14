import {useState, useEffect} from 'react'
import { typeFilterObject } from './mealwrapper'
import {v4 as genKey} from 'uuid'


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
    readonly id : string
    readonly filterObject : typeFilterObject
    mainHandleFunction(cardToMake?:JSX.Element): void

}

interface mainCardProps extends cardProps {
    cardData : JSX.Element

}

interface makerProps {
    readonly reserve : JSX.Element
    mainMaker(cardToMake?:JSX.Element):void
}

let currentAbort: AbortController | null = null

const generateMeal = async function():Promise<mealDbJSON | undefined> {
    try{
        const abort = new AbortController()
        currentAbort = abort
        const abortSignal = abort.signal
        const response = await fetch(mealDbLink, {mode:'cors', signal: abortSignal})
        const mealData = await response.json()
        return mealData

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
        <button onClick={() => {props.mainMaker(props.reserve)}}></button>
    )
}



const MealCard = function(props:cardProps):JSX.Element{ 
    const [meal,setMeal] = useState<JSX.Element>(<div>Loading...</div>)
    
    useEffect(() => {
        const singleRandomMeal  = async function():Promise<void>{
            const mealData = await validateMealData(props.filterObject)
            if(mealData){
                setMeal(
                    <ul id={props.id}>
                        <li>{mealData.name}</li>
                        <li>{mealData.source}</li>
                        <li><img src={mealData.thumb} alt='meal img'/></li>
                    </ul>
                )
            }
            else {
                setMeal(
                    <div id={props.id}>
                        No meals available at the moment. Please try refreshing your browser window.
                    </div>
                )
            }    
                
            
        }
        singleRandomMeal()
        return () => {
            currentAbort?.abort()
        }
        
    },[props.filterObject,props.id])

    return (
    <div>      
    {meal}
    <MainMake reserve={meal} mainMaker={props.mainHandleFunction}/> 
    </div>)

}

const MainMealCard = function(props:mainCardProps):JSX.Element{
    if(props.cardData.props.id === 'new'){
        return(
            <MealCard id={genKey()} filterObject={props.filterObject} mainHandleFunction={props.mainHandleFunction}/>
        )

    }
    return(
        <div>
        {props.cardData}
        <button onClick={() => props.mainHandleFunction()}></button>
        </div>
    )

}



export  {MainMealCard, MealCard}


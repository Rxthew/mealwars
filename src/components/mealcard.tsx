import React, {useState, useEffect} from 'react'
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

export interface mainTransition {
    readonly mainNameSetter: React.Dispatch<React.SetStateAction<string | undefined>>
    mainHandleFunction(cardToMake?:JSX.Element,reservedName?:string): void
    currentMainName() : string | undefined
}

interface cardProps {
    readonly id : string
    readonly filterObject : typeFilterObject
    main: mainTransition
    
}

interface mainCardProps extends cardProps {
    cardData : JSX.Element
    reservedName : string | undefined

}

interface makerProps {
    readonly reserve : JSX.Element
    mainMaker(cardToMake?:JSX.Element, mainName?:string):void
    mainName: string
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



const validateMealData = async function(filterObj:typeFilterObject,mealName:string | undefined):Promise<mealData | undefined> {
    const filterArrayKeys = Object.keys(filterObj).filter(elem => filterObj[elem] === 'no')
    console.log(mealName)
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
            if(mealName === mealObj.name){
                continue
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
        <button onClick={() => {props.mainMaker(props.reserve,props.mainName)}}>Pick {props.mainName}</button>
    )
}



const MealCard = function(props:cardProps):JSX.Element{ 
    let [meal,setMeal] = useState<JSX.Element>(<div>Loading...</div>)
    let [reservedName,setReservedName] = useState<string>('Loading...')
    
    useEffect(() => {     
        const singleRandomMeal  = async function():Promise<void>{
            let mainName = props.main.currentMainName()
            const mealData = await validateMealData(props.filterObject, mainName) 
            if(mealData){
                if(mainName==='new'){
                    props.main.mainNameSetter(mealData.name)
                }
                setReservedName(mealData.name) 
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
        
    },[props])

    return (
    <div>      
    {meal}
    {<MainMake reserve={meal} mainMaker={props.main.mainHandleFunction} mainName={reservedName}/> }
    </div>)

}

const MainMealCard = function(props:mainCardProps):JSX.Element{ 
    if(props.cardData.props.id === 'new'){  
        return(
            <MealCard id={genKey()} filterObject={props.filterObject} main={Object.assign({},props.main,{currentMainName: () => 'new'})}/>
        )

    }
    console.log(props)
    return( 
        <div> 
            {props.cardData}
            <button onClick={() => props.main.mainHandleFunction(undefined,props.reservedName)}>Pick {props.reservedName}</button>
        </div>
    )

}



export  {MainMealCard, MealCard}


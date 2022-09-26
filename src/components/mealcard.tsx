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

export interface fetchOptions {
    fetchState: boolean
    readonly fetchSetter: React.Dispatch<React.SetStateAction<boolean>>
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
    fetchers : fetchOptions
    
    
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

const generateMeal = async function():Promise<mealDbJSON | undefined  > {
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



const validateMealData = async function(filterObj:typeFilterObject,mealName:string | undefined):Promise<mealData | undefined | 'meal unavailable'> {
    const filterArrayKeys = Object.keys(filterObj).filter(elem => filterObj[elem] === 'no')
    for(let count = 0; count < 31; count++){
        if(count === 30){
            return 'meal unavailable'
        }
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
    const nullState = <div id={props.id}>
    No meals available at the moment. Please try refreshing your browser window.
    </div>
    
    useEffect(() => {     
        const singleRandomMeal  = async function():Promise<void>{
            if(props.fetchers.fetchState){
                let mainName = props.main.currentMainName()
                const mealData = await validateMealData(props.filterObject, mainName)
                if(mealData === 'meal unavailable'){
                    props.fetchers.fetchSetter(false)
                } 
                else if(mealData){
                    if(mainName==='new'){
                    props.main.mainNameSetter(mealData.name)
                }
                setReservedName(mealData.name)
                setMeal(
                    <ul id={props.id}>
                        <li>{mealData.name}</li>
                        <li>
                            <a href={mealData.source}>Source</a>
                        </li>
                        <li><img src={mealData.thumb} alt='meal img'/></li>
                    </ul>
                )
            }

            }
                  
            
        }
            singleRandomMeal()
            
        
        
        return () => {
            currentAbort?.abort()
        }
        
    },[props])


    if(props.fetchers.fetchState){
        return (
            <div>      
            {meal}
            <MainMake reserve={meal} mainMaker={props.main.mainHandleFunction} mainName={reservedName}/> 
            </div>)    
      }
      else {
        return nullState
      }
    

}

const MainMealCard = function(props:mainCardProps):JSX.Element{ 
    const nullStateMain = <div id={props.id}>
    No meals available at the moment. Please try refreshing your browser window.
    </div>
    if(props.cardData.props.id === 'new'){  
        return(
            <MealCard id={genKey()} fetchers={props.fetchers} filterObject={props.filterObject} main={Object.assign({},props.main,{currentMainName: () => 'new'})}/>
        ) 

    }
    if(props.fetchers.fetchState){
        return(   
            <div>
                {props.cardData}
                <button onClick={() => props.main.mainHandleFunction(undefined,props.reservedName)}>Pick {props.reservedName}</button>
            </div> 
        )
    }
    else{
        return nullStateMain


    }
    

}



export  {MainMealCard, MealCard}


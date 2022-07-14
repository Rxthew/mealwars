import {useState, useEffect} from 'react'


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
    readonly category: string,
    readonly name: string,
    readonly source : string,
    readonly thumb : string

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

const validateMealData = async function():Promise<mealData | undefined> {
    for(let count = 0; count < 30; count++){
        let currentMeal = await generateMeal()
        if(currentMeal){
            let mealObj:mealData =  {
                category : currentMeal.meals[0].strCategory,
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

const MealCard = function():JSX.Element{
    const [meal,setMeal] = useState<JSX.Element>(<div>Loading...</div>)
    
    const singleRandomMeal  = async function():Promise<void>{
        const mealData = await validateMealData()
        if(mealData){
            setMeal(
                <div>
                    <li>{mealData.category}</li>
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

    useEffect(() => {
        singleRandomMeal()
        
    },[])

    return (
    
    <div>      
    {meal}
    </div>)

}

export default MealCard


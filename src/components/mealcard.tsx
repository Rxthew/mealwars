import {useState, useEffect} from 'react'

const mealDbLink:string = 'https://www.themealdb.com/api/json/v1/1/random.php' 


const MealCard = function():JSX.Element{
    const [meal,setMeal] = useState<JSX.Element>(<div>Loading...</div>)
    const SingleRandomMeal  = async function():Promise<void>{
        const response = await fetch(mealDbLink, {mode:'cors'})
        const mealData = await response.json()
        const mealObj = {
            category : mealData.meals[0].strCategory,
            name: mealData.meals[0].strMeal,
            source: mealData.meals[0].strSource,
            tags: mealData.meals[0].strTags,
            thumb: mealData.meals[0].strMealThumb
        }
        setMeal(
            <div>
                <li>{mealObj.category}</li>
                <li>{mealObj.name}</li>
                <li>{mealObj.source}</li>
                <li>{mealObj.tags}</li>
                <li><img src={mealObj.thumb} alt='meal img'/></li>
            </div>
            
            )
    }
      
    useEffect(() => {
        SingleRandomMeal()
        
    },[])

    return (
    
    <div>      
    {meal}
    </div>)

}

export default MealCard


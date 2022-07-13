import React, {useState, useEffect} from 'react'

interface mealData {
 readonly  category : string,
 readonly  name : string, 
 readonly  source: string,
 readonly  tags : string,
 readonly  thumb: string

}

const mealDbLink:string = 'https://www.themealdb.com/api/json/v1/1/random.php' 

const singleRandomMeal = async function():Promise<mealData>{
    const response = await fetch(mealDbLink, {mode:'cors'})
    const mealData = await response.json()
    return {
        category : mealData.meals[0].idMeal,
        name: mealData.meals[0].idMeal,
        source: mealData.meals[0].idMeal,
        tags: mealData.meals[0].idMeal,
        thumb: mealData.meals[0].idMeal
    }
    
}


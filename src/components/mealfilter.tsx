import {useState, useEffect} from 'react'


interface mealCategoriesJSON {
    categories : [{
        readonly strCategory : string
    }]
}



const mealCategoriesLink:string = 'https://www.themealdb.com/api/json/v1/1/categories.php'

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

const CategoryFilter = function():JSX.Element{

    let [filter, setFilter] = useState(<li></li>)

    const displayCategories = async function(){
        const filterArray = await filterList()
    
        if(filterArray){
            setFilter(<ul>
                {filterArray.map(elem => <li>{elem}</li>)}
                </ul>
            )
        }

    }

    useEffect(()=>{
        displayCategories()
    },[])

    return (
        <div>
            {filter}
        </div>
    )
}

export default CategoryFilter
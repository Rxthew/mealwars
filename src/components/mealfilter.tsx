import React, {useState, useEffect} from 'react'
import {typeFilterObject} from './mealwrapper'

 
const CategoryFilter = function(filterObject:typeFilterObject, setFilterObject:React.Dispatch<React.SetStateAction<typeFilterObject>>):JSX.Element{ 
    let [filter, setFilter] = useState(<li></li>) 
    const filterArrayKeys = Object.keys(filterObject)
    useEffect(()=>{
        const filterItem = function(event:React.MouseEvent){
            if(event.target === event.currentTarget){
                return
            }
            const target = event.target as HTMLElement
            setFilterObject(
                filterObject[target.id] === 'yes' ? Object.assign({},filterObject,{[target.id] : 'no'}) : Object.assign({},filterObject,{[target.id] : 'yes'})
            ) 
        }
        
        setFilter(
            <ul onClick={filterItem}> 
            {filterArrayKeys.map(elem => filterObject[elem] === 'yes' ? <li id={elem}>{elem}</li> : <li id={elem} className='excluded'>{elem}</li>)}
            </ul>
        )
           
    },[filterArrayKeys,filterObject,setFilterObject])

    return ( 
        <div>
            {filter}
        </div>
    )
}

export default CategoryFilter
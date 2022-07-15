import React, {useState, useEffect} from 'react'
import {typeFilterObject} from './mealwrapper'

interface categoryProps {
    filterObject: typeFilterObject, 
    setFilterObject: React.Dispatch<React.SetStateAction<typeFilterObject>>
}
 
const CategoryFilter = function(props:categoryProps):JSX.Element{ 
    let [filter, setFilter] = useState(<li></li>) 
    const filterArrayKeys = Object.keys(props.filterObject)
    useEffect(()=>{
        const filterItem = function(event:React.MouseEvent){
            if(event.target === event.currentTarget){
                return
            }
            const target = event.target as HTMLElement
            props.setFilterObject(
                props.filterObject[target.id] === 'yes' ? Object.assign({},props.filterObject,{[target.id] : 'no'}) : Object.assign({},props.filterObject,{[target.id] : 'yes'})
            ) 
        }
        
        setFilter(
            <ul onClick={filterItem}> 
            {filterArrayKeys.map(elem => props.filterObject[elem] === 'yes' ? <li id={elem}>{elem}</li> : <li id={elem} className='excluded'>{elem}</li>)}
            </ul>
        )
           
    },[filterArrayKeys,props])

    return ( 
        <div>
            {filter}
        </div>
    )
}

export default CategoryFilter
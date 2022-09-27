import React, {useState, useEffect} from 'react'
import {typeFilterObject} from './mealwrapper'
import {v4 as genKey} from 'uuid'

interface categoryProps {
    filterObject: typeFilterObject, 
    setFilterObject: React.Dispatch<React.SetStateAction<typeFilterObject>>
}
 
const CategoryFilter = function(props:categoryProps):JSX.Element{ 
    let [filter, setFilter] = useState(<aside>Loading...</aside>) 
    
    useEffect(()=>{
        const filterArrayKeys = Object.keys(props.filterObject)
        const filterItem = function(event:React.MouseEvent){
            if(event.target === event.currentTarget){
                return
            }
            const eventTarget = event.target as HTMLElement
            const target = eventTarget.closest('button') as HTMLElement
            props.setFilterObject(
                props.filterObject[target.id] === 'yes' ? Object.assign({},props.filterObject,{[target.id] : 'no'}) : Object.assign({},props.filterObject,{[target.id] : 'yes'})
            ) 
        }
        if(filterArrayKeys.length > 0){
            setFilter(
                <menu onClick={filterItem}> 
                {filterArrayKeys.map(elem => props.filterObject[elem] === 'yes' ? <li key={genKey()}><button id={elem}>{elem}</button></li> : <li key={genKey()}><button id={elem}><s>{elem}</s></button></li>)}
                </menu>
            )
        }
        else{
            setFilter(
                <aside>
                    No meal categories available at the moment. Please try refreshing your browser window.
                </aside>
            )
        }
        
       
           
    },[props])

    return ( 
        <div>
            {filter}
        </div>
    )
}

export default CategoryFilter
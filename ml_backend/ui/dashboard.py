"""
Streamlit dashboard for vehicle pricing pipeline
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from pipeline.run_pipeline import VehiclePricingPipeline
from utils.data_storage import DataStorage

class VehiclePricingDashboard:
    """Streamlit dashboard for vehicle pricing analysis"""
    
    def __init__(self):
        self.pipeline = VehiclePricingPipeline()
        self.data_storage = DataStorage()
        
    def run(self):
        """Main dashboard interface"""
        st.set_page_config(
            page_title="Vehicle Pricing Intelligence",
            page_icon="🚗",
            layout="wide",
            initial_sidebar_state="expanded"
        )
        
        st.title("🚗 Vehicle Pricing Intelligence Dashboard")
        st.markdown("---")
        
        # Sidebar
        self.render_sidebar()
        
        # Main content
        page = st.session_state.get('page', 'Overview')
        
        if page == 'Overview':
            self.render_overview()
        elif page == 'Real-time Pricing':
            self.render_real_time_pricing()
        elif page == 'Market Analysis':
            self.render_market_analysis()
        elif page == 'Pipeline Status':
            self.render_pipeline_status()
        elif page == 'Model Performance':
            self.render_model_performance()
        elif page == 'Data Management':
            self.render_data_management()
    
    def render_sidebar(self):
        """Render sidebar navigation"""
        st.sidebar.title("Navigation")
        
        pages = [
            "Overview",
            "Real-time Pricing", 
            "Market Analysis",
            "Pipeline Status",
            "Model Performance",
            "Data Management"
        ]
        
        selected_page = st.sidebar.selectbox("Select Page", pages)
        st.session_state['page'] = selected_page
        
        st.sidebar.markdown("---")
        
        # Quick stats
        st.sidebar.subheader("Quick Stats")
        try:
            stats = self.data_storage.get_database_stats()
            st.sidebar.metric("Total Listings", stats.get('vehicle_listings_count', 0))
            st.sidebar.metric("Total Predictions", stats.get('price_predictions_count', 0))
            st.sidebar.metric("Training Runs", stats.get('training_metrics_count', 0))
        except Exception as e:
            st.sidebar.error(f"Error loading stats: {str(e)}")
        
        # Pipeline controls
        st.sidebar.markdown("---")
        st.sidebar.subheader("Pipeline Controls")
        
        if st.sidebar.button("Run Scraping"):
            with st.spinner("Running scraping cycle..."):
                result = self.pipeline.run_scraping_cycle()
                st.sidebar.success(f"Scraping complete: {result}")
        
        if st.sidebar.button("Train Model"):
            with st.spinner("Training model..."):
                result = self.pipeline.run_training_cycle()
                st.sidebar.success(f"Training complete: {result}")
        
        if st.sidebar.button("Generate Predictions"):
            with st.spinner("Generating predictions..."):
                result = self.pipeline.run_prediction_cycle()
                st.sidebar.success(f"Predictions complete: {result}")
    
    def render_overview(self):
        """Render overview dashboard"""
        st.header("📊 Overview")
        
        # Key metrics
        col1, col2, col3, col4 = st.columns(4)
        
        try:
            status = self.pipeline.get_pipeline_status()
            stats = self.data_storage.get_database_stats()
            
            with col1:
                st.metric("Total Listings", stats.get('vehicle_listings_count', 0))
            
            with col2:
                st.metric("Predictions Made", stats.get('price_predictions_count', 0))
            
            with col3:
                last_scraping = status.get('last_scraping')
                if last_scraping:
                    hours_ago = (datetime.now() - last_scraping).total_seconds() / 3600
                    st.metric("Last Scraping", f"{hours_ago:.1f}h ago")
                else:
                    st.metric("Last Scraping", "Never")
            
            with col4:
                metrics = status.get('model_metrics', {})
                mae = metrics.get('mae', 0)
                st.metric("Model MAE", f"${mae:,.0f}" if mae else "N/A")
        
        except Exception as e:
            st.error(f"Error loading overview data: {str(e)}")
        
        st.markdown("---")
        
        # Recent activity
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Recent Scraping Activity")
            try:
                # Load recent scraping logs
                recent_logs = self.data_storage.get_recent_scraping_logs(limit=10)
                if recent_logs:
                    df = pd.DataFrame(recent_logs)
                    st.dataframe(df)
                else:
                    st.info("No recent scraping activity")
            except Exception as e:
                st.error(f"Error loading scraping logs: {str(e)}")
        
        with col2:
            st.subheader("Model Performance Trend")
            try:
                # Load training history
                training_history = self.data_storage.get_retraining_history(limit=10)
                if training_history:
                    df = pd.DataFrame(training_history)
                    df['created_at'] = pd.to_datetime(df['created_at'])
                    
                    fig = px.line(df, x='created_at', y='mae', 
                                 title='Model MAE Over Time')
                    st.plotly_chart(fig, use_container_width=True)
                else:
                    st.info("No training history available")
            except Exception as e:
                st.error(f"Error loading training history: {str(e)}")
    
    def render_real_time_pricing(self):
        """Render real-time pricing interface"""
        st.header("💰 Real-time Pricing")
        
        # Input form
        st.subheader("Get Price Prediction")
        
        with st.form("price_prediction_form"):
            col1, col2, col3 = st.columns(3)
            
            with col1:
                make = st.text_input("Make", value="Toyota")
                model = st.text_input("Model", value="Camry")
                year = st.number_input("Year", min_value=2000, max_value=2024, value=2020)
            
            with col2:
                mileage = st.number_input("Mileage", min_value=0, max_value=500000, value=50000)
                body_type = st.selectbox("Body Type", ["Sedan", "SUV", "Truck", "Coupe", "Hatchback"])
                fuel_type = st.selectbox("Fuel Type", ["Gasoline", "Hybrid", "Electric", "Diesel"])
            
            with col3:
                transmission = st.selectbox("Transmission", ["Automatic", "Manual", "CVT"])
                drivetrain = st.selectbox("Drivetrain", ["FWD", "RWD", "AWD", "4WD"])
                location = st.text_input("Location", value="Los Angeles, CA")
            
            submitted = st.form_submit_button("Get Prediction")
            
            if submitted:
                vehicle_data = {
                    'make': make,
                    'model': model,
                    'year': year,
                    'mileage': mileage,
                    'body_type': body_type,
                    'fuel_type': fuel_type,
                    'transmission': transmission,
                    'drivetrain': drivetrain,
                    'location': location
                }
                
                try:
                    prediction = self.pipeline.get_real_time_prediction(vehicle_data)
                    
                    if 'error' in prediction:
                        st.error(f"Prediction error: {prediction['error']}")
                    else:
                        # Display prediction results
                        st.success("Prediction Generated!")
                        
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            predicted_price = prediction.get('predicted_price', 0)
                            st.metric("Predicted Price", f"${predicted_price:,.0f}")
                        
                        with col2:
                            confidence = prediction.get('confidence_interval', {})
                            lower = confidence.get('lower_bound', 0)
                            upper = confidence.get('upper_bound', 0)
                            st.metric("Price Range", f"${lower:,.0f} - ${upper:,.0f}")
                        
                        with col3:
                            insights = prediction.get('market_insights', {})
                            category = insights.get('price_category', 'Unknown')
                            st.metric("Price Category", category.title())
                        
                        # Market insights
                        st.subheader("Market Insights")
                        recommendations = insights.get('recommendations', [])
                        if recommendations:
                            for rec in recommendations:
                                st.info(rec)
                        
                        # Show prediction details
                        with st.expander("Prediction Details"):
                            st.json(prediction)
                
                except Exception as e:
                    st.error(f"Error generating prediction: {str(e)}")
    
    def render_market_analysis(self):
        """Render market analysis interface"""
        st.header("📈 Market Analysis")
        
        # Filters
        st.subheader("Analysis Filters")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            make_filter = st.selectbox("Make", ["All", "Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz"])
        
        with col2:
            year_range = st.slider("Year Range", 2010, 2024, (2015, 2024))
        
        with col3:
            price_range = st.slider("Price Range", 0, 100000, (10000, 80000))
        
        # Build filters
        filters = {}
        if make_filter != "All":
            filters['make'] = make_filter
        filters['year_min'] = year_range[0]
        filters['year_max'] = year_range[1]
        filters['price_min'] = price_range[0]
        filters['price_max'] = price_range[1]
        
        try:
            # Get market analysis
            analysis = self.pipeline.get_market_analysis(filters)
            
            if 'error' in analysis:
                st.error(f"Analysis error: {analysis['error']}")
            else:
                # Display analysis results
                st.subheader("Market Overview")
                
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric("Total Vehicles", analysis.get('total_vehicles', 0))
                
                with col2:
                    avg_price = analysis.get('average_price', 0)
                    st.metric("Average Price", f"${avg_price:,.0f}")
                
                with col3:
                    price_range = analysis.get('price_range', {})
                    min_price = price_range.get('min', 0)
                    max_price = price_range.get('max', 0)
                    st.metric("Price Range", f"${min_price:,.0f} - ${max_price:,.0f}")
                
                with col4:
                    st.metric("Analysis Date", analysis.get('generated_at', 'N/A')[:10])
                
                # Popular makes chart
                st.subheader("Popular Makes")
                popular_makes = analysis.get('popular_makes', {})
                if popular_makes:
                    df_makes = pd.DataFrame(list(popular_makes.items()), 
                                          columns=['Make', 'Count'])
                    fig = px.bar(df_makes, x='Make', y='Count', title='Vehicle Count by Make')
                    st.plotly_chart(fig, use_container_width=True)
                
                # Price by year chart
                st.subheader("Average Price by Year")
                by_year = analysis.get('by_year', {})
                if by_year:
                    df_year = pd.DataFrame(list(by_year.items()), 
                                         columns=['Year', 'Average Price'])
                    df_year['Year'] = df_year['Year'].astype(int)
                    fig = px.line(df_year, x='Year', y='Average Price', 
                                 title='Average Vehicle Price by Year')
                    st.plotly_chart(fig, use_container_width=True)
        
        except Exception as e:
            st.error(f"Error loading market analysis: {str(e)}")
    
    def render_pipeline_status(self):
        """Render pipeline status interface"""
        st.header("🔧 Pipeline Status")
        
        try:
            status = self.pipeline.get_pipeline_status()
            
            # Overall status
            st.subheader("Overall Status")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                last_scraping = status.get('last_scraping')
                if last_scraping:
                    st.success(f"Last Scraping: {last_scraping}")
                else:
                    st.warning("No recent scraping")
            
            with col2:
                last_training = status.get('last_training')
                if last_training:
                    st.success(f"Last Training: {last_training}")
                else:
                    st.warning("No training completed")
            
            with col3:
                last_prediction = status.get('last_prediction')
                if last_prediction:
                    st.success(f"Last Prediction: {last_prediction}")
                else:
                    st.warning("No predictions generated")
            
            # Scraper status
            st.subheader("Scraper Status")
            scraper_status = status.get('scraper_status', {})
            
            for scraper_name, scraper_info in scraper_status.items():
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**{scraper_name.title()}**")
                    
                    if scraper_info['status'] == 'healthy':
                        st.success("✅ Healthy")
                    else:
                        st.error("❌ Error")
                
                with col2:
                    last_success = scraper_info.get('last_success')
                    last_error = scraper_info.get('last_error')
                    
                    if last_success:
                        st.write(f"Last Success: {last_success}")
                    if last_error:
                        st.write(f"Last Error: {last_error}")
            
            # Model metrics
            st.subheader("Current Model Metrics")
            model_metrics = status.get('model_metrics', {})
            
            if model_metrics:
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    mae = model_metrics.get('mae', 0)
                    st.metric("MAE", f"${mae:,.0f}")
                
                with col2:
                    rmse = model_metrics.get('rmse', 0)
                    st.metric("RMSE", f"${rmse:,.0f}")
                
                with col3:
                    r2 = model_metrics.get('r2', 0)
                    st.metric("R² Score", f"{r2:.3f}")
                
                with col4:
                    mape = model_metrics.get('mape', 0)
                    st.metric("MAPE", f"{mape:.1f}%")
            else:
                st.info("No model metrics available")
        
        except Exception as e:
            st.error(f"Error loading pipeline status: {str(e)}")
    
    def render_model_performance(self):
        """Render model performance interface"""
        st.header("🎯 Model Performance")
        
        try:
            # Training history
            st.subheader("Training History")
            training_history = self.data_storage.get_retraining_history(limit=20)
            
            if training_history:
                df = pd.DataFrame(training_history)
                df['created_at'] = pd.to_datetime(df['created_at'])
                
                # Performance metrics over time
                col1, col2 = st.columns(2)
                
                with col1:
                    fig = px.line(df, x='created_at', y='mae', 
                                 title='Mean Absolute Error Over Time')
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    fig = px.line(df, x='created_at', y='r2', 
                                 title='R² Score Over Time')
                    st.plotly_chart(fig, use_container_width=True)
                
                # Training samples trend
                if 'training_samples' in df.columns:
                    fig = px.bar(df, x='created_at', y='training_samples',
                                title='Training Samples Over Time')
                    st.plotly_chart(fig, use_container_width=True)
                
                # Detailed metrics table
                st.subheader("Detailed Metrics")
                display_columns = ['created_at', 'mae', 'rmse', 'r2', 'mape', 'training_samples']
                available_columns = [col for col in display_columns if col in df.columns]
                st.dataframe(df[available_columns])
            
            else:
                st.info("No training history available")
            
            # Feature importance (if available)
            st.subheader("Feature Importance")
            try:
                if hasattr(self.pipeline.price_model, 'model') and self.pipeline.price_model.model:
                    importance_df = self.pipeline.price_model.get_feature_importance()
                    if not importance_df.empty:
                        fig = px.bar(importance_df, x='importance', y='feature', 
                                    orientation='h', title='Feature Importance')
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.info("Feature importance not available")
                else:
                    st.info("Model not loaded")
            except Exception as e:
                st.error(f"Error loading feature importance: {str(e)}")
        
        except Exception as e:
            st.error(f"Error loading model performance: {str(e)}")
    
    def render_data_management(self):
        """Render data management interface"""
        st.header("🗄️ Data Management")
        
        try:
            # Database statistics
            st.subheader("Database Statistics")
            stats = self.data_storage.get_database_stats()
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Raw Listings", stats.get('raw_listings_count', 0))
                st.metric("Vehicle Listings", stats.get('vehicle_listings_count', 0))
            
            with col2:
                st.metric("Price Predictions", stats.get('price_predictions_count', 0))
                st.metric("Training Metrics", stats.get('training_metrics_count', 0))
            
            with col3:
                db_size = stats.get('database_size_bytes', 0)
                st.metric("Database Size", f"{db_size / (1024*1024):.1f} MB")
                st.metric("Scraping Logs", stats.get('scraping_logs_count', 0))
            
            # Data date range
            date_range = stats.get('data_date_range', {})
            if date_range:
                st.info(f"Data Range: {date_range.get('earliest', 'N/A')} to {date_range.get('latest', 'N/A')}")
            
            # Data cleanup
            st.subheader("Data Cleanup")
            
            col1, col2 = st.columns(2)
            
            with col1:
                cleanup_days = st.number_input("Keep data for days", min_value=1, max_value=365, value=90)
                
                if st.button("Clean Old Data"):
                    with st.spinner("Cleaning old data..."):
                        result = self.data_storage.cleanup_old_data(cleanup_days)
                        st.success(f"Cleanup complete: {result}")
            
            with col2:
                if st.button("Refresh Statistics"):
                    st.rerun()
        
        except Exception as e:
            st.error(f"Error loading data management: {str(e)}")

def main():
    """Main function to run the dashboard"""
    dashboard = VehiclePricingDashboard()
    dashboard.run()

if __name__ == "__main__":
    main()
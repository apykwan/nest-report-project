import { Controller, Get, Query, Post, Body, UseGuards, Patch, Param } from '@nestjs/common';

import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { Serialize } from '../interceptors/serialize.interceptor';
import { User } from '../users/user.entity';
import { ReportDto } from './dtos/report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { AuthGuard } from '../guards/auth.guards';
import { AdminGuard } from '../guards/admin.guard';

@Controller('reports')
export class ReportsController {
    constructor(private reportsService: ReportsService){}

    @Get()
    getEstimate(@Query() query: GetEstimateDto) {
        return this.reportsService.createEstimate(query);
    }

    @Post()
    @UseGuards(AuthGuard)
    @Serialize(ReportDto)
    createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
        return this.reportsService.create(body, user);
    }

    @Patch('/:id')
    @UseGuards(AdminGuard)
    approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
        return this.reportsService.changeApproval(parseInt(id), body.approved);
    }
}
